"use client";

import { usePhotoUpload } from "../../hooks/use-photo-upload";
import { UploadZone } from "./upload-zone";
import type { TExifData, TImageInfo } from "@/modules/photos/lib/utils";

interface PhotoUploaderProps {
  onUploadSuccess?: (
    url: string,
    exif: TExifData | null,
    imageInfo: TImageInfo
  ) => void;
  folder?: string;
  onCreateSuccess?: () => void;
}

export function PhotoUploader({ onUploadSuccess, folder }: PhotoUploaderProps) {
  const { isUploading, handleUpload, uploadProgress } = usePhotoUpload({
    folder,
    onUploadSuccess,
  });

  return (
    <UploadZone
      isUploading={isUploading}
      onUpload={handleUpload}
      uploadProgress={uploadProgress}
    />
  );
}
