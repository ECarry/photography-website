"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhotoUploader } from "./photo-uploader";

interface PhotoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotoUploadModal = ({
  open,
  onOpenChange,
}: PhotoUploadModalProps) => {
  return (
    <ResponsiveModal
      title="Upload Photo"
      open={open}
      onOpenChange={onOpenChange}
    >
      <PhotoUploader onCreateSuccess={() => onOpenChange(false)} />
    </ResponsiveModal>
  );
};
