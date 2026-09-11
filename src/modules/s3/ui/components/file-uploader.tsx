/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";
import { ALLOWED_IMAGE_EXTENSIONS, IMAGE_SIZE_LIMIT } from "@/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { s3Client } from "@/modules/s3/lib/upload-client";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CloudUpload, ImageIcon, Upload, XIcon } from "lucide-react";

interface FileUploaderProps {
  onUploadSuccess?: (key: string) => void;
  folder?: string;
  value?: string;
  disabled?: boolean;
  onUploadStateChange?: (uploading: boolean) => void;
  onRemove?: () => void;
}

const FileUploader = ({
  onUploadSuccess,
  folder = "uploads",
  value,
  disabled = false,
  onUploadStateChange,
  onRemove,
}: FileUploaderProps) => {
  const [files, setFiles] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
    }>
  >([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [deletedKey, setDeletedKey] = useState<string | null>(null);
  const objectUrlsRef = useRef(new Set<string>());
  const uploadInFlight = useRef(false);

  const trpc = useTRPC();
  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const uploadFile = useCallback(
    async (file: File, fileId: string) => {
      if (uploadInFlight.current || disabled) return;
      uploadInFlight.current = true;
      onUploadStateChange?.(true);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, uploading: true, progress: 0, error: false } : f))
      );

      try {
        const { publicUrl } = await s3Client.upload({
          file,
          folder,
          onProgress: (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
            );
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

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  uploading: false,
                  progress: 100,
                  error: false,
                  key: publicUrl,
                }
              : f
          )
        );

        toast.success("File uploaded successfully");
        // new successful upload, clear any previously deleted key marker
        setDeletedKey(null);
        onUploadSuccess?.(publicUrl);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  uploading: false,
                  error: true,
                  progress: 0,
                }
              : f
          )
        );

        toast.error(
          `Failed to upload ${file.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        uploadInFlight.current = false;
        onUploadStateChange?.(false);
      }
    },
    [createPresignedUrl, onUploadSuccess, folder, disabled, onUploadStateChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (uploadInFlight.current || disabled || deleteFile.isPending) return;
      // Do something with the files
      if (acceptedFiles.length > 0) {
        const newFiles = acceptedFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
          objectUrl: URL.createObjectURL(file),
        }));

        objectUrlsRef.current.forEach((objectUrl) => {
          URL.revokeObjectURL(objectUrl);
        });
        objectUrlsRef.current.clear();

        newFiles.forEach((file) => {
          if (file.objectUrl) objectUrlsRef.current.add(file.objectUrl);
        });

        setFiles(newFiles);

        // when new file(s) selected, show image loading placeholder again
        setImageLoading(true);

        // Auto upload after adding files
        newFiles.forEach((fileItem) => {
          uploadFile(fileItem.file, fileItem.id);
        });
      }
    },
    [uploadFile, disabled, deleteFile.isPending]
  );

  useEffect(() => {
    const urls = objectUrlsRef.current;

    return () => {
      urls.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      urls.clear();
    };
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tooManyFiles = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === "too-many-files"
      );

      const fileInvalidType = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === "file-invalid-type"
      );

      if (tooManyFiles) {
        toast.error("Too many files");
      }

      if (fileInvalidType) {
        toast.error("File type is not supported");
      }

      if (fileRejections.some((file) => file.errors.some((error) => error.code === "file-too-large"))) {
        toast.error(`Choose an image smaller than ${IMAGE_SIZE_LIMIT / 1024 / 1024} MB`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    multiple: false,
    maxSize: IMAGE_SIZE_LIMIT,
    disabled: disabled || files.some((file) => file.uploading) || deleteFile.isPending,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [...ALLOWED_IMAGE_EXTENSIONS],
    },
  });

  const handleDeleteFile = useCallback(
    async (key: string | undefined) => {
      if (!key || disabled || deleteFile.isPending || uploadInFlight.current) return;
      if (!window.confirm("Permanently delete this image from storage? This cannot be undone.")) return;

      const fileToDelete = files.find((f) => f.key === key);

      if (fileToDelete?.uploading) {
        toast.error("Cannot delete file while uploading");
        return;
      }

      try {
        setFiles((prev) =>
          prev.map((f) => (f.key === key ? { ...f, isDeleting: true } : f))
        );

        await deleteFile.mutateAsync({ key });

        setFiles((prev) => {
          const remaining = prev.filter((f) => f.key !== key);
          const removed = prev.find((f) => f.key === key);
          if (removed?.objectUrl) {
            URL.revokeObjectURL(removed.objectUrl);
            objectUrlsRef.current.delete(removed.objectUrl);
          }
          return remaining;
        });

        // remember which key was deleted so we don't keep showing it via `value`
        setDeletedKey(key);
        onUploadSuccess?.("");

        toast.success("File deleted successfully");
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) => (f.key === key ? { ...f, isDeleting: false } : f))
        );

        toast.error(
          error instanceof Error ? error.message : "Failed to delete file"
        );
      }
    },
    [deleteFile, files, disabled, onUploadSuccess]
  );

  const currentFile = files[0];
  const displayImageUrl = currentFile?.objectUrl
    ? currentFile.objectUrl
    : value && value !== deletedKey
    ? keyToUrl(value) || "/placeholder.svg"
    : undefined;

  const hasImage = !!displayImageUrl;
  const hasError = files.some((file) => file.error);
  const isBusy = disabled || !!currentFile?.uploading || deleteFile.isPending;

  const handleRemove = () => {
    if (isBusy) return;
    if (!onRemove) {
      void handleDeleteFile(currentFile?.key || value);
      return;
    }
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    setFiles([]);
    setDeletedKey(value || currentFile?.key || null);
    onRemove();
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "group relative overflow-hidden rounded-xl transition-all duration-200 border border-border",
          isDragActive
            ? "border-dashed border-primary bg-primary/5"
            : hasImage
            ? "border-border bg-background hover:border-primary/50"
            : "border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} className="sr-only" />

        {hasImage ? (
          <div className="relative aspect-video w-full">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-5" />
                  <span className="text-sm">Loading image...</span>
                </div>
              </div>
            )}

            <img
              src={displayImageUrl}
              alt="Preview"
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />

            {currentFile?.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="relative">
                  <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-white/20"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 28 * (1 - currentFile.progress / 100)
                      }`}
                      className="text-white transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {Math.round(currentFile.progress)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex min-h-48 w-full flex-col items-center justify-center gap-3 p-5 text-center"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <CloudUpload className="size-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload Cover Image</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop an image here, or click to browse
              </p>
            </div>

            <Button variant="outline" size="sm" type="button" onClick={open} disabled={isBusy}>
              <ImageIcon className="mr-1 size-4" />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {hasImage && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={open} disabled={isBusy} variant="outline" size="sm" type="button">
            <Upload className="size-3.5" /> Replace
          </Button>
          {(value || currentFile?.key) && (
            <Button onClick={handleRemove} disabled={isBusy} variant="ghost" size="sm" type="button">
              <XIcon className="size-3.5" /> Remove
            </Button>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, AVIF, HEIC / HEIF · Max {IMAGE_SIZE_LIMIT / 1024 / 1024} MB</p>
      {hasError && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>
            <p>Your previous cover has not been changed. Retry or choose another image.</p>
            <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => currentFile && uploadFile(currentFile.file, currentFile.id)}>
              Retry upload
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUploader;
