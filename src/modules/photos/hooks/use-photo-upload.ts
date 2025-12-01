import { useState } from "react";
import { toast } from "sonner";
import { s3Client } from "@/modules/s3/lib/upload-client";
import {
  type TExifData,
  type TImageInfo,
  getPhotoExif,
  getImageInfo,
} from "@/modules/photos/lib/utils";
import { DEFAULT_PHOTOS_UPLOAD_FOLDER } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface UsePhotoUploadProps {
  folder?: string;
  onUploadSuccess?: (
    url: string,
    exif: TExifData | null,
    imageInfo: TImageInfo
  ) => void;
}

export function usePhotoUpload({
  folder = DEFAULT_PHOTOS_UPLOAD_FOLDER,
  onUploadSuccess,
}: UsePhotoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<TExifData | null>(null);
  const [imageInfo, setImageInfo] = useState<TImageInfo | null>(null);

  const trpc = useTRPC();
  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const [exifData, imageInfo] = await Promise.all([
        getPhotoExif(file),
        getImageInfo(file),
      ]);
      setExif(exifData);
      setImageInfo(imageInfo);

      const { publicUrl } = await s3Client.upload({
        file,
        folder,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        getUploadUrl: async ({ filename, contentType, folder }) => {
          const data = await createPresignedUrl.mutateAsync({
            filename,
            contentType,
            size: file.size,
            folder,
          });

          return {
            uploadUrl: data.presignedUrl,
            publicUrl: data.key,
          };
        },
      });

      setUploadedImageUrl(publicUrl);
      toast.success("Photo uploaded successfully!");
      onUploadSuccess?.(publicUrl, exifData, imageInfo);
    } catch (error) {
      setExif(null);
      setImageInfo(null);
      setUploadedImageUrl(null);

      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload photo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadedImageUrl,
    exif,
    imageInfo,
    handleUpload,
  };
}
