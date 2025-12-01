import { S3Client } from "@aws-sdk/client-s3";

/**
 * Server-side S3 client initialization.
 * This client is used for backend operations like generating presigned URLs and deleting files.
 * It uses the AWS SDK v3.
 */
export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});
