"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import BlurImage from "@/components/blur-image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PhotoUploader } from "./photo-uploader";
import { TExifData, TImageInfo } from "@/modules/photos/lib/utils";
import { keyToImage } from "@/lib/keyToImage";
import { ApertureSelector } from "./aperture-selector";
import { ShutterSpeedSelector } from "./shutter-speed-selector";
import { ISOSelector } from "./iso-selector";
import { ExposureCompensationSelector } from "./exposure-compensation-selector";

// ============================================================================
// CONSTANTS & SCHEMAS
// ============================================================================

// Initial form values
const INITIAL_FORM_VALUES = {
  url: "",
  title: "",
  description: "",
  visibility: "private" as const,
  isFavorite: false,
};

// Form validation schemas for each step
const firstStepSchema = z.object({
  url: z
    .string()
    .min(1, { message: "Please upload a photo before proceeding" }),
});

const secondStepSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["private", "public"]).default("private"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isFavorite: z.boolean().default(false),
  // Camera parameters
  make: z.string().optional(),
  model: z.string().optional(),
  lensModel: z.string().optional(),
  focalLength: z.number().optional(),
  focalLength35mm: z.number().optional(),
  fNumber: z.number().optional(),
  iso: z.number().optional(),
  exposureTime: z.number().optional(),
  exposureCompensation: z.number().optional(),
});

const thirdStepSchema = z.object({});

const fourthStepSchema = z.object({});

// Combined schema for type inference (not used in runtime validation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  ...firstStepSchema.shape,
  ...secondStepSchema.shape,
  ...thirdStepSchema.shape,
});

type FormData = z.infer<typeof formSchema>;

// ============================================================================
// TYPES
// ============================================================================

interface MultiStepFormProps {
  className?: string;
  onSubmit?: (data: FormData) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MultiStepForm({
  className,
  onSubmit,
}: MultiStepFormProps) {
  // ========================================
  // State Management
  // ========================================

  // Step control
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form data
  const [formData, setFormData] =
    useState<Partial<FormData>>(INITIAL_FORM_VALUES);

  // Upload-related state
  const [url, setUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<TExifData | null>(null);
  const [imageInfo, setImageInfo] = useState<TImageInfo>();
  const [isCopied, setIsCopied] = useState(false);

  // ========================================
  // Configuration
  // ========================================

  // Define the steps
  const steps = [
    {
      id: "upload",
      title: "Upload",
      description: "Upload your photo",
      schema: firstStepSchema,
    },
    {
      id: "metadata",
      title: "Metadata",
      description: "Add metadata to your photo",
      schema: secondStepSchema,
    },
    {
      id: "location",
      title: "Location",
      description: "Add location to your photo",
      schema: thirdStepSchema,
    },
    {
      id: "preview",
      title: "Preview",
      description: "Preview your photo",
      schema: fourthStepSchema,
    },
  ];

  const currentStepSchema = steps[step].schema;
  const progress = ((step + 1) / steps.length) * 100;

  // ========================================
  // Form Setup
  // ========================================

  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(currentStepSchema) as any,
    defaultValues: formData,
    mode: "onChange", // Enable validation on change
  });

  const { handleSubmit, reset, formState } = form;
  const { isValid } = formState;
  
  // For step 0, check if url exists; for other steps, use form validation
  const isStepValid = step === 0 ? !!url : isValid;

  // ========================================
  // Handlers
  // ========================================

  // Handle step navigation and form submission
  const handleNextStep = (data: unknown) => {
    // Step 1: Upload - merge upload data with EXIF
    if (step === 0) {
      const updatedData = {
        ...formData,
        ...(data as Record<string, unknown>),
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
      };
      setFormData(updatedData);

      if (step < steps.length - 1) {
        setStep(step + 1);
        reset(updatedData);
      }
      return;
    }

    // Other steps: merge form data and navigate
    const updatedData = { ...formData, ...(data as Record<string, unknown>) };
    setFormData(updatedData);

    if (step < steps.length - 1) {
      // Move to next step
      setStep(step + 1);
      reset(updatedData);
    } else {
      // Final submission
      console.log("=== Form Submission Debug ===");
      console.log("All form data:", updatedData);
      console.log("URL:", url);
      console.log("EXIF data:", exif);
      console.log("Image info:", imageInfo);
      console.log("============================");

      setIsSubmitting(true);
      setTimeout(() => {
        if (onSubmit) {
          onSubmit(updatedData as FormData);
        }
        setIsComplete(true);
        setIsSubmitting(false);
      }, 1500);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Handle URL copy to clipboard
  const handleCopyUrl = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(keyToImage(url));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Reset uploaded photo state
  const handleReupload = () => {
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
    setIsCopied(false);
    form.setValue("url", "");
    setFormData({ ...formData, url: "" });
  };

  // Reset entire form
  const handleReset = () => {
    setStep(0);
    setFormData(INITIAL_FORM_VALUES);
    setIsComplete(false);
    setUrl(null);
    setExif(null);
    setImageInfo(undefined);
    setIsCopied(false);
    reset(INITIAL_FORM_VALUES);
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
  // Render
  // ========================================

  return (
    <div
      className={cn(
        "bg-card/40 mx-auto w-full max-w-2xl rounded-lg p-6 shadow-lg",
        className
      )}
    >
      {!isComplete ? (
        <>
          {/* Progress bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between">
              <span className="text-sm font-medium">
                Step {step + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="mb-8 flex justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                      ? "bg-primary text-primary-foreground ring-primary/30 ring-2"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className="mt-1 hidden text-xs sm:block">{s.title}</span>
              </div>
            ))}
          </div>

          {/* Form */}
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
                <h2 className="text-xl font-bold">{steps[step].title}</h2>
                <p className="text-muted-foreground text-sm">
                  {steps[step].description}
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={handleSubmit(handleNextStep)}
                  className="space-y-4"
                >
                  {step === 0 && (
                    <div className="space-y-2">
                      {!url || !imageInfo ? (
                        <>
                          <PhotoUploader
                            folder="my-photos"
                            onUploadSuccess={(url, exif, imageInfo) => {
                              setUrl(url);
                              setExif(exif);
                              setImageInfo(imageInfo);
                              form.setValue("url", url, { shouldValidate: true });
                            }}
                          />
                          <FormField
                            control={form.control}
                            name="url"
                            render={({ fieldState }) => (
                              <FormItem>
                                {fieldState.error && <FormMessage />}
                              </FormItem>
                            )}
                          />
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Photo uploaded successfully</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleReupload}
                            >
                              Re-upload
                            </Button>
                          </div>

                          {/* Image preview */}
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                            <BlurImage
                              blurhash={imageInfo.blurhash}
                              src={keyToImage(url)}
                              alt="Uploaded photo"
                              fill
                              className="object-contain w-full h-full"
                              unoptimized
                            />
                          </div>

                          {/* URL with copy button */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Image URL
                            </label>
                            <InputGroup>
                              <InputGroupInput
                                value={keyToImage(url)}
                                readOnly
                                className="font-mono text-xs"
                              />
                              <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                  onClick={handleCopyUrl}
                                  size="icon-xs"
                                  aria-label="Copy URL"
                                >
                                  {isCopied ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {step === 1 && (
                    <div className="gap-6">
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Photo title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="visibility"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Visibility</FormLabel>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {field.value === "public"
                                      ? "Public"
                                      : "Private"}
                                  </span>
                                  <FormControl>
                                    <Switch
                                      checked={field.value === "public"}
                                      onCheckedChange={(checked) =>
                                        field.onChange(
                                          checked ? "public" : "private"
                                        )
                                      }
                                    />
                                  </FormControl>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={5}
                                  className="resize-none"
                                  placeholder="Photo description"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Camera Parameters Section */}
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <h3 className="text-sm font-semibold">
                              Camera Parameters
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {exif
                                ? "Auto-filled from EXIF data. You can edit these values."
                                : "No EXIF data found. Please fill in manually."}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="make"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Camera Make</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Canon"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="model"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Camera Model</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., EOS R5"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="lensModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lens Model</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="e.g., RF 24-70mm f/2.8L"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="focalLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Focal Length (mm)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      placeholder="50"
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const val = e.target.value
                                          ? parseFloat(e.target.value)
                                          : undefined;
                                        field.onChange(val);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="focalLength35mm"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>35mm Equivalent (mm)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.1"
                                      placeholder="50"
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const val = e.target.value
                                          ? parseFloat(e.target.value)
                                          : undefined;
                                        field.onChange(val);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <FormField
                              control={form.control}
                              name="fNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Aperture</FormLabel>
                                  <FormControl>
                                    <ApertureSelector
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="exposureTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shutter Speed</FormLabel>
                                  <FormControl>
                                    <ShutterSpeedSelector
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="iso"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ISO</FormLabel>
                                  <FormControl>
                                    <ISOSelector
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="exposureCompensation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>EV</FormLabel>
                                  <FormControl>
                                    <ExposureCompensationSelector
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 2 && <div className="space-y-2">Step 3</div>}
                  {step === 3 && <div className="space-y-2">Step 4</div>}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={step === 0}
                      className={cn(step === 0 && "invisible")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isStepValid}>
                      {step === steps.length - 1 ? (
                        isSubmitting ? (
                          "Submitting..."
                        ) : (
                          "Submit"
                        )
                      ) : (
                        <>
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="py-10 text-center"
        >
          <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle2 className="text-primary h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Form Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for completing the form. We&apos;ll be in touch soon.
          </p>
          <Button onClick={handleReset}>Start Over</Button>
        </motion.div>
      )}
    </div>
  );
}
