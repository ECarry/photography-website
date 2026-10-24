import { describe, expect, it } from "vitest";
import { photosUpdateSchema } from "@/db/schema";

describe("photosUpdateSchema", () => {
  it("preserves editable EXIF fields", () => {
    const exifFields = {
      make: "Camera Co.",
      model: "Model X",
      lensModel: "Prime 35mm",
      focalLength: 35,
      focalLength35mm: 35,
      fNumber: 2.8,
      iso: 400,
      exposureTime: 0.01,
      exposureCompensation: 0.5,
    };

    expect(photosUpdateSchema.parse(exifFields)).toMatchObject(exifFields);
  });
});
