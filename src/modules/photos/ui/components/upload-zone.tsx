import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { IMAGE_SIZE_LIMIT } from "@/constants";

interface UploadZoneProps {
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  uploadProgress: number;
}

export function UploadZone({
  isUploading,
  onUpload,
  uploadProgress,
}: UploadZoneProps) {
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        await onUpload(file);
      }
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-full size-32 bg-muted cursor-pointer",
          { "opacity-50": isUploading }
        )}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 relative size-32">
          <UploadCloud className="size-20 opacity-70" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h1 className={cn(isUploading && "opacity-50")}>
          Drag and drop photo file to upload
        </h1>
        <p className="text-xs text-muted-foreground">
          Your photo will be private until you publish it.
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum file size: {IMAGE_SIZE_LIMIT / 1024 / 1024} MB
        </p>
      </div>
      {isUploading ? (
        <Button
          disabled
          className="relative"
          style={{
            background: `linear-gradient(to right, rgb(34 197 94) ${uploadProgress}%, rgb(15 23 42) ${uploadProgress}%)`,
          }}
        >
          Uploading... {uploadProgress}%
        </Button>
      ) : (
        <Button type="button" disabled={isUploading} onClick={open}>
          Select file
        </Button>
      )}
    </div>
  );
}
