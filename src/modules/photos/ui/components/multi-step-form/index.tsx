"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TExifData, TImageInfo } from "@/modules/photos/lib/utils";
import { PhotoFormData, INITIAL_FORM_VALUES, STEP_CONFIG } from "./types";
import { FirstStep } from "./steps/first-step";
import { SecondStep } from "./steps/second-step";
import { ThirdStep } from "./steps/third-step";
import { FourthStep } from "./steps/fourth-step";
import { ProgressBar } from "./components/progress-bar";
import { StepIndicator } from "./components/step-indicator";
import { SuccessScreen } from "./components/success-screen";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// TYPES
// ============================================================================

interface MultiStepFormProps {
  className?: string;
  onSubmit?: (data: PhotoFormData) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MultiStepForm({
  className,
  onSubmit,
}: MultiStepFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createPhoto = useMutation(trpc.photos.create.mutationOptions());
  const removeS3Object = useMutation(trpc.s3.deleteFile.mutationOptions());
  // ========================================
  // State Management
  // ========================================

  // Step control
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form data
  const [formData, setFormData] =
    useState<Partial<PhotoFormData>>(INITIAL_FORM_VALUES);

  // Upload-related state
  const [url, setUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<TExifData | null>(null);
  const [imageInfo, setImageInfo] = useState<TImageInfo>();

  // Address state for geocoding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [address, setAddress] = useState<any>(null);

  // ========================================
  // Handlers
  // ========================================

  // Handle upload success
  const handleUploadSuccess = (
    uploadedUrl: string,
    uploadedExif: TExifData | null,
    uploadedImageInfo: TImageInfo
  ) => {
    setUrl(uploadedUrl);
    setExif(uploadedExif);
    setImageInfo(uploadedImageInfo);
  };

  // Handle re-upload
  const handleReupload = (url: string) => {
    removeS3Object.mutate({ key: url });
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
  };

  // Handle next step
  const handleNext = (data: Partial<PhotoFormData>) => {
    let updatedData = { ...formData, ...data };

    // Step 1: Add upload data and EXIF
    if (step === 0) {
      console.log("=== Step 0: EXIF Data Extraction ===");
      console.log("EXIF data:", exif);
      console.log("Extracted fields:");
      console.log("  - dateTimeOriginal:", exif?.dateTimeOriginal);
      console.log("  - latitude:", exif?.latitude);
      console.log("  - longitude:", exif?.longitude);
      console.log("  - gpsAltitude:", exif?.gpsAltitude);
      console.log("=====================================");

      updatedData = {
        ...updatedData,
        url: url || "",
        exif,
        imageInfo,
        // Pre-fill camera parameters from EXIF
        make: exif?.make,
        model: exif?.model,
        lensModel: exif?.lensModel,
        focalLength: exif?.focalLength,
        focalLength35mm: exif?.focalLength35mm,
        fNumber: exif?.fNumber,
        iso: exif?.iso,
        exposureTime: exif?.exposureTime,
        exposureCompensation: exif?.exposureCompensation,
        latitude: exif?.latitude,
        longitude: exif?.longitude,
        gpsAltitude: exif?.gpsAltitude,
        dateTimeOriginal: exif?.dateTimeOriginal,
      };
    }

    setFormData(updatedData);

    if (step < STEP_CONFIG.length - 1) {
      // Move to next step
      setStep(step + 1);
    } else {
      // Final submission - integrate all data including address and image info
      const finalData = {
        ...updatedData,
        url: url || "",
        title: updatedData.title || "",
        description: updatedData.description || "",
        // Add image dimensions and blur data from imageInfo
        aspectRatio: imageInfo ? imageInfo.width / imageInfo.height : 1,
        width: imageInfo?.width || 0,
        height: imageInfo?.height || 0,
        blurData: imageInfo?.blurhash || "",
        // Add address data from geocoding if available
        country: address?.features?.[0]?.properties?.context?.country?.name,
        countryCode:
          address?.features?.[0]?.properties?.context?.country?.country_code,
        region: address?.features?.[0]?.properties?.context?.region?.name,
        city:
          address?.features?.[0]?.properties?.context?.country?.country_code ===
            "JP" ||
          address?.features?.[0]?.properties?.context?.country?.country_code ===
            "TW"
            ? address?.features?.[0]?.properties?.context?.region?.name
            : address?.features?.[0]?.properties?.context?.place?.name,
        district: address?.features?.[0]?.properties?.context?.locality?.name,
        fullAddress: address?.features?.[0]?.properties?.full_address,
        placeFormatted: address?.features?.[0]?.properties?.place_formatted,
      };

      console.log("=== Form Submission ===");
      console.log("Final data:", finalData);
      console.log("Key fields:");
      console.log("  - dateTimeOriginal:", finalData.dateTimeOriginal);
      console.log("  - latitude:", finalData.latitude);
      console.log("  - longitude:", finalData.longitude);
      console.log("  - gpsAltitude:", finalData.gpsAltitude);
      console.log("======================");

      setIsSubmitting(true);

      // Use tRPC mutation instead of callback
      createPhoto.mutate(finalData, {
        onSuccess: async () => {
          // Invalidate queries to refetch photos list
          await queryClient.invalidateQueries(
            trpc.photos.getMany.queryOptions({})
          );

          toast.success("Photo uploaded successfully!");
          setIsComplete(true);
          setIsSubmitting(false);

          // Also call the optional callback if provided
          if (onSubmit) {
            onSubmit(finalData as PhotoFormData);
          }
        },
        onError: (error) => {
          toast.error(error.message);
          setIsSubmitting(false);
        },
      });
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Reset entire form
  const handleReset = () => {
    setStep(0);
    setFormData(INITIAL_FORM_VALUES);
    setIsComplete(false);
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
    setAddress(null);
  };

  // Handle address update from geocoding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddressUpdate = (addressData: any) => {
    setAddress(addressData);
  };

  // ========================================
  // Animation Configuration
  // ========================================

  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // ========================================
  // Render Step Content
  // ========================================

  const renderStep = () => {
    const commonProps = {
      initialData: formData,
      isSubmitting,
      onBack: handleBack,
    };

    switch (step) {
      case 0:
        return (
          <FirstStep
            {...commonProps}
            url={url}
            exif={exif}
            imageInfo={imageInfo}
            onUploadSuccess={handleUploadSuccess}
            onReupload={handleReupload}
            onNext={handleNext}
          />
        );
      case 1:
        return <SecondStep {...commonProps} exif={exif} onNext={handleNext} />;
      case 2:
        return (
          <ThirdStep
            {...commonProps}
            onNext={handleNext}
            onAddressUpdate={handleAddressUpdate}
          />
        );
      case 3:
        return <FourthStep {...commonProps} onNext={handleNext} />;
      default:
        return null;
    }
  };

  // ========================================
  // Render
  // ========================================

  return (
    <div className={cn("mx-auto w-full", className)}>
      {!isComplete ? (
        <>
          <ProgressBar currentStep={step} totalSteps={STEP_CONFIG.length} />
          <StepIndicator steps={STEP_CONFIG} currentStep={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold">{STEP_CONFIG[step].title}</h2>
                <p className="text-muted-foreground text-sm">
                  {STEP_CONFIG[step].description}
                </p>
              </div>

              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <SuccessScreen onReset={handleReset} />
      )}
    </div>
  );
}
