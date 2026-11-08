import { s3Client } from "@/modules/s3/lib/server-client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, or, sql } from "drizzle-orm";
import {
  ALLOWED_UPLOAD_FOLDERS,
  ALLOWED_CONTENT_TYPES,
  IMAGE_SIZE_LIMIT,
} from "@/constants";
import { sanitizeUploadFilename } from "@/modules/s3/lib/sanitize-upload-filename";
import {
  canDeleteS3Object,
  createPendingUploadDeleteToken,
  isAllowedS3ObjectKey,
} from "@/modules/s3/lib/delete-authorization";
import { photos, posts } from "@/db/schema";
import { logger } from "@/lib/logger";

/**
 * Generate a public URL for accessing uploaded photos
 * Uses React cache to memoize results and improve performance
 * @param filename - The name of the uploaded file
 * @param folder - The folder where the file is stored
 * @returns The complete public URL for accessing the file
 * @throws Error if S3_PUBLIC_URL is not configured
 */
export const s3Router = createTRPCRouter({
  createPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string().trim().min(1).max(255),
        contentType: z.enum(ALLOWED_CONTENT_TYPES),
        size: z.number().positive().max(IMAGE_SIZE_LIMIT),
        folder: z.enum(ALLOWED_UPLOAD_FOLDERS).default("uploads"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { filename, contentType, size, folder } = input;
        const uuid = crypto.randomUUID();
        const key = `${folder}/${uuid}-${sanitizeUploadFilename(filename)}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          ContentType: contentType,
          ContentLength: size,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 60 * 6, // 6 minutes
        });
        const deleteToken = createPendingUploadDeleteToken({
          key,
          userId: ctx.auth.id,
          secret: process.env.BETTER_AUTH_SECRET!,
        });

        return {
          presignedUrl,
          key,
          deleteToken,
        };
      } catch (error) {
        logger.error("S3 presigned URL generation failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),
  deleteFile: protectedProcedure
    .input(
      z.object({
        key: z.string().trim().min(1).max(512),
        deleteToken: z.string().max(128).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { key, deleteToken } = input;
        if (!isAllowedS3ObjectKey(key)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid storage key",
          });
        }

        const [photoReference] = await ctx.db
          .select({ id: photos.id })
          .from(photos)
          .where(eq(photos.url, key))
          .limit(1);
        const doubleQuotedImageSource = `src="${key}"`;
        const singleQuotedImageSource = `src='${key}'`;
        const [postReference] = await ctx.db
          .select({ id: posts.id })
          .from(posts)
          .where(
            or(
              eq(posts.coverImage, key),
              sql`strpos(coalesce(${posts.content}, ''), ${doubleQuotedImageSource}) > 0 OR strpos(coalesce(${posts.content}, ''), ${singleQuotedImageSource}) > 0`,
            ),
          )
          .limit(1);
        const isDatabaseReferenced = Boolean(photoReference || postReference);
        const isAuthorized = canDeleteS3Object({
          key,
          userId: ctx.auth.id,
          secret: process.env.BETTER_AUTH_SECRET!,
          token: deleteToken ?? "",
          isDatabaseReferenced,
        });

        if (!isAuthorized) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "File is not associated with an uploaded record",
          });
        }

        const command = new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        });
        await s3Client.send(command);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        logger.error("S3 file deletion failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),
});
