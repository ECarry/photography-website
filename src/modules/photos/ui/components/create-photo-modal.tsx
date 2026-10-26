"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import MultiStepForm from "./multi-step-form";
import { useModal } from "@/hooks/use-modal";

const CreatePhotoModal = () => {
  const { isOpen, onClose } = useModal();

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={onClose}
      title="Add photo"
      className="max-h-[94dvh] w-full overflow-y-auto overscroll-contain px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-0 sm:max-h-[90dvh] sm:max-w-3xl sm:p-6"
      dismissible={false}
    >
      <MultiStepForm />
    </ResponsiveModal>
  );
};

export default CreatePhotoModal;
