import { IMAGE_SIZE_LIMIT } from "@/constants";

/**
 * Client-side S3 upload helper.
 * This utility handles file validation and uploading to S3 using presigned URLs.
 * It is designed to be used in frontend components.
 */
interface UploadToS3Options {
  file: File;
  folder: string;
  onProgress?: (progress: number) => void;
  getUploadUrl: (input: {
    filename: string;
    contentType: string;
    folder: string;
  }) => Promise<{ uploadUrl: string; publicUrl: string }>;
}

interface UploadToS3Result {
  publicUrl: string;
}

class UploadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "UploadError";
  }
}

export class S3Client {
  /**
   * generate a unique filename
   * @param originalFilename the original filename
   * @returns the unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const extension = originalFilename.split(".").pop() || "";
    const baseName = originalFilename.replace(`.${extension}`, "");
    return `${baseName}-${timestamp}.${extension}`;
  }

  /**
   * validate file
   * @param file the file to be validated
   * @throws {UploadError} if file validation fails
   */
  private validateFile(file: File) {
    const MAX_FILE_SIZE = IMAGE_SIZE_LIMIT;
    if (file.size > MAX_FILE_SIZE) {
      throw new UploadError(
        `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      );
    }

    // validate file type
    if (!file.type.startsWith("image/")) {
      throw new UploadError("Only image files are allowed");
    }
  }

  /**
   *  XMLHttpRequest upload with progress
   * @param file the file to be uploaded
   * @param uploadUrl the upload url
   * @param onProgress the progress callback
   */
  private async uploadWithProgress(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(progress);
        }
      });

      // complete
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(
            new UploadError(`Upload failed with status ${xhr.status}`, {
              status: xhr.status,
              response: xhr.response,
            })
          );
        }
      };

      // error
      xhr.onerror = () => {
        reject(new UploadError("Network error during upload"));
      };

      xhr.ontimeout = () => {
        reject(new UploadError("Upload timed out"));
      };

      // timeout
      xhr.timeout = 60000;

      // send request
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  }

  /**
   * Upload file to Cloudflare R2
   * @param options the upload options
   * @returns the upload result, containing the public URL
   * @throws {UploadError} if the upload fails
   */
  async upload({
    file,
    folder,
    onProgress,
    getUploadUrl,
  }: UploadToS3Options): Promise<UploadToS3Result> {
    try {
      this.validateFile(file);

      const uniqueFilename = this.generateUniqueFilename(file.name);

      const { uploadUrl, publicUrl } = await getUploadUrl({
        filename: uniqueFilename,
        contentType: file.type,
        folder,
      });

      await this.uploadWithProgress(file, uploadUrl, onProgress);

      return { publicUrl };
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        "Failed to upload file",
        error instanceof Error ? error : undefined
      );
    }
  }
}

export const s3Client = new S3Client();
