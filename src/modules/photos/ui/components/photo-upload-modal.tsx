"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhotoUploader } from "./photo-uploader";
import { useState } from "react";

interface PhotoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotoUploadModal = ({open, onOpenChange}: PhotoUploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <>
      <ResponsiveModal
        title="Upload a photo"
        open={isUploading || open}
        onOpenChange={onOpenChange}
        className="h-[80vh] w-[80vw] max-w-none"
      >
        <ScrollArea className="pr-4">
          <PhotoUploader onCreateSuccess={() => setIsUploading(false)} />
        </ScrollArea>
      </ResponsiveModal>
    </>
  );
};
