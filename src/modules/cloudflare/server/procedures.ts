import { s3Client } from "@/lib/s3";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

/**
 * Generate a public URL for accessing uploaded photos
 * Uses React cache to memoize results and improve performance
 * @param filename - The name of the uploaded file
 * @param folder - The folder where the file is stored
 * @returns The complete public URL for accessing the file
 * @throws Error if S3_PUBLIC_URL is not configured
 */
export const cloudflareRouter = createTRPCRouter({
  createPresignedUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        folder: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { filename, contentType, size, folder } = input;
        const uuid = crypto.randomUUID();
        const key = folder
          ? `${folder}/${uuid}-${filename}`
          : `${uuid}-${filename}`;

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          ContentType: contentType,
          ContentLength: size,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 60 * 6, // 6 minutes
        });

        return {
          presignedUrl,
          key,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),
  deleteFile: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { key } = input;
        const command = new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        });
        await s3Client.send(command);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file",
        });
      }
    }),
});
