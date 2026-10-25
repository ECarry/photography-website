import { describe, expect, it } from "vitest";
import { sanitizeUploadFilename } from "@/modules/s3/lib/sanitize-upload-filename";

describe("sanitizeUploadFilename", () => {
  it("removes path segments and unsafe filename characters", () => {
    expect(sanitizeUploadFilename("../../my photo?.jpg")).toBe("my_photo_.jpg");
  });

  it("limits the filename length and provides a fallback", () => {
    expect(sanitizeUploadFilename("a".repeat(200))).toHaveLength(120);
    expect(sanitizeUploadFilename("../...")).toBe("upload");
  });
});
