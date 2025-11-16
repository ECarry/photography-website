/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { s3Client } from "@/modules/s3/lib/s3";

interface FileUploaderProps {
  onUploadSuccess?: (key: string) => void;
  folder?: string;
}

const FileUploader = ({
  onUploadSuccess,
  folder = "uploads",
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

  const trpc = useTRPC();
  const createPresignedUrl = useMutation(
    trpc.s3.createPresignedUrl.mutationOptions()
  );

  const deleteFile = useMutation(trpc.s3.deleteFile.mutationOptions());

  const uploadFile = useCallback(
    async (file: File, fileId: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, uploading: true } : f))
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
          getUploadUrl: async ({ filename, contentType }) => {
            const data = await createPresignedUrl.mutateAsync({
              filename,
              contentType,
              size: file.size,
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
      }
    },
    [createPresignedUrl, onUploadSuccess, folder]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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

        setFiles(newFiles);

        // Auto upload after adding files
        newFiles.forEach((fileItem) => {
          uploadFile(fileItem.file, fileItem.id);
        });
      }
    },
    [uploadFile]
  );

  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.objectUrl) {
          URL.revokeObjectURL(f.objectUrl);
        }
      });
    };
  }, [files]);

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
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
  });

  const handleDeleteFile = useCallback(
    async (key: string | undefined) => {
      if (!key) return;

      const fileToDelete = files.find((f) => f.key === key);

      if (fileToDelete?.uploading) {
        toast.error("Cannot delete file while uploading");
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteFile, files]
  );

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "border border-dashed border-gray-300 p-4 cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center duration-200 rounded-md",
          isDragActive && "border-gray-500"
        )}
      >
        <input {...getInputProps()} accept="image/*" />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>Drag &apos;n&apos; drop some file here, or click to select file</p>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between mb-2"
            >
              <div className="flex items-center">
                <img
                  src={file.objectUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover mr-2"
                />
                <div>
                  <p className="font-semibold">{file.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.file.size} bytes
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {file.uploading ? (
                  <div className="flex items-center">
                    <p className="mr-2">Uploading...</p>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteFile(file.key)}
                    type="button"
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FileUploader;
