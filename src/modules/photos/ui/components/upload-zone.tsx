import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, ImagePlus, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { ALLOWED_IMAGE_EXTENSIONS, IMAGE_SIZE_LIMIT } from "@/constants";

interface UploadZoneProps {
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  uploadProgress: number;
  uploadError?: string | null;
}

export function UploadZone({
  isUploading,
  onUpload,
  uploadProgress,
  uploadError,
}: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDropAccepted: async ([file]) => {
      if (!file) return;
      setRejection(null);
      setSelectedFile(file);
      await onUpload(file);
    },
    onDropRejected: (files) => {
      const codes = files.flatMap((file) => file.errors.map((error) => error.code));
      setRejection(
        codes.includes("file-too-large")
          ? `Please choose an image smaller than ${IMAGE_SIZE_LIMIT / 1024 / 1024} MB.`
          : codes.includes("too-many-files")
            ? "Please upload one photo at a time."
            : "This format is not supported. Choose one of the image formats listed below.",
      );
    },
    accept: {
      "image/*": [...ALLOWED_IMAGE_EXTENSIONS],
    },
    maxSize: IMAGE_SIZE_LIMIT,
    multiple: false,
    disabled: isUploading,
    noClick: true,
    noKeyboard: true,
  });
  const error = rejection || uploadError;

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        aria-busy={isUploading}
        className={cn(
          "relative flex min-h-60 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/20 p-4 text-center transition-colors sm:min-h-72 sm:gap-5 sm:p-10",
          isDragActive && "border-primary bg-primary/5",
          (isDragReject || error) && "border-destructive/50",
          !isDragActive && !error && "border-border hover:border-primary/50",
        )}
      >
        <input {...getInputProps()} aria-label="Choose a photo" />
        <div className="rounded-xl border bg-background p-3 text-primary shadow-sm sm:rounded-2xl sm:p-4">
          {isUploading ? <Loader2 className="size-7 animate-spin sm:size-8" /> : <UploadCloud className="size-7 sm:size-8" />}
        </div>
        <div className="max-w-sm space-y-1.5 sm:space-y-2">
          <h3 className="text-base font-medium sm:text-lg">
            {isUploading ? "Uploading your photo" : isDragActive ? "Drop your photo here" : "Give your next photo a home"}
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {isUploading ? "Keep this window open while we prepare your image." : "Drag and drop a photo anywhere in this area, or browse your files."}
          </p>
        </div>
        {isUploading ? (
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground" role="status">
              <span>{uploadProgress === 0 ? "Preparing image & metadata…" : uploadProgress === 100 ? "Finishing upload…" : "Uploading original"}</span>
              <span className="font-medium tabular-nums">{uploadProgress}%</span>
            </div>
            <div role="progressbar" aria-label="Photo upload" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress} className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
            <Button type="button" onClick={open} className="h-10 w-full sm:w-auto">
            <ImagePlus className="size-4" /> Choose photo
          </Button>
        )}
        <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
          JPG, PNG, WebP, AVIF, HEIC / HEIF · Up to {IMAGE_SIZE_LIMIT / 1024 / 1024} MB
          <br />Camera settings are extracted automatically when available.
        </p>
      </div>
      {selectedFile && (
        <div className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2.5 text-xs sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
          <ImagePlus className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{selectedFile.name}</span>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground sm:text-xs">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive sm:gap-3 sm:p-4 sm:text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <p>{error}</p>
            {uploadError && !rejection && selectedFile && !isUploading && (
              <Button type="button" variant="outline" size="sm" onClick={() => onUpload(selectedFile)}>
                <RotateCcw className="size-3.5" /> Retry upload
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
