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
          "relative flex min-h-72 flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed bg-muted/20 p-6 text-center transition-colors sm:p-10",
          isDragActive && "border-primary bg-primary/5",
          (isDragReject || error) && "border-destructive/50",
          !isDragActive && !error && "border-border hover:border-primary/50",
        )}
      >
        <input {...getInputProps()} aria-label="Choose a photo" />
        <div className="rounded-2xl border bg-background p-4 text-primary shadow-sm">
          {isUploading ? <Loader2 className="size-8 animate-spin" /> : <UploadCloud className="size-8" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {isUploading ? "Uploading your photo" : isDragActive ? "Drop your photo here" : "Give your next photo a home"}
          </h3>
          <p className="text-sm text-muted-foreground">
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
          <Button type="button" onClick={open}>
            <ImagePlus className="size-4" /> Choose photo
          </Button>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          JPG, PNG, WebP, AVIF, HEIC / HEIF · Up to {IMAGE_SIZE_LIMIT / 1024 / 1024} MB
          <br />Camera settings are extracted automatically when available.
        </p>
      </div>
      {selectedFile && (
        <div className="flex min-w-0 items-center gap-3 rounded-lg border px-4 py-3 text-sm">
          <ImagePlus className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">{selectedFile.name}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
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
