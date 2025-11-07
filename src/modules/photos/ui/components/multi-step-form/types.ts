import { z } from "zod";
import { TExifData, TImageInfo } from "@/modules/photos/lib/utils";

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export const firstStepSchema = z.object({
  url: z
    .string()
    .min(1, { message: "Please upload a photo before proceeding" }),
});

export type FirstStepData = z.infer<typeof firstStepSchema>;

export const secondStepSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  visibility: z.enum(["private", "public"]).default("private"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  gpsAltitude: z.number().optional(),
  dateTimeOriginal: z.date().optional(),
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

export type SecondStepData = z.infer<typeof secondStepSchema>;

export const thirdStepSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ThirdStepData = z.infer<typeof thirdStepSchema>;

export const fourthStepSchema = z.object({});

export type FourthStepData = z.infer<typeof fourthStepSchema>;

// Combined schema for type inference (not used in runtime validation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  ...firstStepSchema.shape,
  ...secondStepSchema.shape,
  ...thirdStepSchema.shape,
  ...fourthStepSchema.shape,
  exif: z.custom<TExifData | null>().optional(),
  imageInfo: z.custom<TImageInfo>().optional(),
});

export type PhotoFormData = z.infer<typeof formSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface StepProps {
  onNext: (data: Partial<PhotoFormData>) => void;
  onBack?: () => void;
  initialData?: Partial<PhotoFormData>;
  isSubmitting?: boolean;
}

export interface UploadStepProps extends StepProps {
  url: string | null;
  exif: TExifData | null;
  imageInfo: TImageInfo | undefined;
  onUploadSuccess: (
    url: string,
    exif: TExifData | null,
    imageInfo: TImageInfo
  ) => void;
  onReupload: () => void;
}

export interface MetadataStepProps extends StepProps {
  exif: TExifData | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const INITIAL_FORM_VALUES: Partial<PhotoFormData> = {
  url: "",
  title: "",
  description: "",
  visibility: "private",
  isFavorite: false,
};

export const STEP_CONFIG = [
  {
    id: "upload",
    title: "Upload",
    description: "Upload your photo",
  },
  {
    id: "metadata",
    title: "Metadata",
    description: "Add metadata to your photo",
  },
  {
    id: "location",
    title: "Location",
    description: "Add location to your photo",
  },
  {
    id: "preview",
    title: "Preview",
    description: "Preview your photo",
  },
];
