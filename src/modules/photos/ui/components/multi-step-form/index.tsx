"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TExifData, TImageInfo } from "@/modules/photos/lib/utils";
import { PhotoFormData, INITIAL_FORM_VALUES, STEP_CONFIG } from "./types";
import type { AddressData } from "@/modules/mapbox/hooks/use-get-address";
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
import { logger } from "@/lib/logger";

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
  const pendingUploadKeysRef = useRef(new Set<string>());
  const removeS3ObjectRef = useRef(removeS3Object.mutateAsync);
  const isMountedRef = useRef(false);
  const isCreatingPhotoRef = useRef(false);

  useEffect(() => {
    removeS3ObjectRef.current = removeS3Object.mutateAsync;
  }, [removeS3Object.mutateAsync]);

  useEffect(
    () => {
      const pendingUploadKeys = pendingUploadKeysRef.current;
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        if (isCreatingPhotoRef.current) return;

        for (const key of pendingUploadKeys) {
          void removeS3ObjectRef.current({ key }).catch((error) => {
            logger.error("Abandoned photo upload cleanup failed", error, { key });
          });
        }
      };
    },
    [],
  );
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
  const [address, setAddress] = useState<AddressData>(null);

  // ========================================
  // Handlers
  // ========================================

  // Handle upload success
  const handleUploadSuccess = (
    uploadedUrl: string,
    uploadedExif: TExifData | null,
    uploadedImageInfo: TImageInfo
  ) => {
    pendingUploadKeysRef.current.add(uploadedUrl);
    setUrl(uploadedUrl);
    setExif(uploadedExif);
    setImageInfo(uploadedImageInfo);
  };

  // Handle re-upload
  const handleReupload = (url: string) => {
    void removeS3Object.mutateAsync({ key: url }).then(
      () => pendingUploadKeysRef.current.delete(url),
      (error) => {
        logger.error("Replaced photo upload cleanup failed", error, { key: url });
        toast.error("Could not remove the previous uploaded photo");
      },
    );
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
  };

  // Handle next step
  const handleNext = (data: Partial<PhotoFormData>) => {
    let updatedData = { ...formData, ...data };

    // Step 1: Add upload data and EXIF
    if (step === 0) {
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

      setIsSubmitting(true);

      isCreatingPhotoRef.current = true;
      void (async () => {
        try {
          await createPhoto.mutateAsync(finalData);
        } catch (error) {
          const uploadedKey = finalData.url;
          if (uploadedKey) {
            try {
              await removeS3Object.mutateAsync({ key: uploadedKey });
              pendingUploadKeysRef.current.delete(uploadedKey);
              if (isMountedRef.current) {
                setUrl(null);
                setExif(null);
                setImageInfo(undefined);
                setStep(0);
              }
            } catch (cleanupError) {
              logger.error("Failed photo creation cleanup failed", cleanupError, {
                key: uploadedKey,
              });
              if (isMountedRef.current) {
                toast.error("Could not clean up the uploaded photo");
              }
            }
          }
          isCreatingPhotoRef.current = false;
          if (isMountedRef.current) {
            toast.error(
              error instanceof Error ? error.message : "Failed to create photo",
            );
            setIsSubmitting(false);
          }
          return;
        }

        isCreatingPhotoRef.current = false;
        pendingUploadKeysRef.current.delete(finalData.url);
        try {
          await Promise.all([
            queryClient.invalidateQueries(
              trpc.photos.getMany.queryOptions({}),
            ),
            queryClient.invalidateQueries(
              trpc.home.getManyLikePhotos.queryOptions({ limit: 10 }),
            ),
            queryClient.invalidateQueries(
              trpc.home.getCitySets.queryOptions({ limit: 9 }),
            ),
            queryClient.invalidateQueries(trpc.city.getMany.queryOptions()),
          ]);
        } catch (error) {
          logger.error("Photo queries refresh failed after creation", error);
        }

        if (!isMountedRef.current) return;
        toast.success("Photo uploaded successfully!");
        setIsComplete(true);
        setIsSubmitting(false);
        onSubmit?.(finalData as PhotoFormData);
      })();
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
  const handleAddressUpdate = (addressData: AddressData) => {
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
