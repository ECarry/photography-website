import { describe, expect, it } from "vitest";
import {
  canDeleteS3Object,
  createPendingUploadDeleteToken,
  isAllowedS3ObjectKey,
  verifyPendingUploadDeleteToken,
} from "@/modules/s3/lib/delete-authorization";

const key = "photos/6d25a2f4-12cd-4d8a-a045-1bb56dab83ac-photo.jpg";
const userId = "user-1";
const secret = "test-secret";

describe("S3 delete authorization", () => {
  it("accepts only a single key under an allowed upload folder", () => {
    expect(isAllowedS3ObjectKey(key)).toBe(true);
    expect(isAllowedS3ObjectKey("posts/cover.webp")).toBe(true);
    expect(isAllowedS3ObjectKey("photos/2024/trip/photo.jpg")).toBe(true);
    expect(isAllowedS3ObjectKey("unknown/file.jpg")).toBe(false);
    expect(isAllowedS3ObjectKey("photos/../posts/file.jpg")).toBe(false);
    expect(isAllowedS3ObjectKey("photos//file.jpg")).toBe(false);
    expect(isAllowedS3ObjectKey("photos\\file.jpg")).toBe(false);
    expect(isAllowedS3ObjectKey("https://bucket.example/file.jpg")).toBe(false);
  });

  it("signs pending-upload cleanup tokens for one user and key", () => {
    const now = 1_000_000;
    const expiresAt = now + 60_000;
    const token = createPendingUploadDeleteToken({
      key,
      userId,
      secret,
      expiresAt,
    });

    expect(
      verifyPendingUploadDeleteToken({
        key,
        userId,
        secret,
        token,
        now,
      }),
    ).toBe(true);
    expect(
      verifyPendingUploadDeleteToken({
        key,
        userId: "another-user",
        secret,
        token,
        now,
      }),
    ).toBe(false);
    expect(
      verifyPendingUploadDeleteToken({
        key: "photos/another-file.jpg",
        userId,
        secret,
        token,
        now,
      }),
    ).toBe(false);
    expect(
      verifyPendingUploadDeleteToken({
        key,
        userId,
        secret,
        token,
        now: expiresAt,
      }),
    ).toBe(false);
  });

  it("requires a database reference or a valid pending-upload token", () => {
    const token = createPendingUploadDeleteToken({
      key,
      userId,
      secret,
      expiresAt: 2_000_000,
    });

    expect(
      canDeleteS3Object({
        key,
        userId,
        secret,
        token: "",
        isDatabaseReferenced: true,
      }),
    ).toBe(true);
    expect(
      canDeleteS3Object({
        key,
        userId,
        secret,
        token: "",
        isDatabaseReferenced: false,
      }),
    ).toBe(false);
    expect(
      canDeleteS3Object({
        key,
        userId,
        secret,
        token,
        isDatabaseReferenced: false,
        now: 1_000_000,
      }),
    ).toBe(true);
    expect(
      canDeleteS3Object({
        key: "other/file.jpg",
        userId,
        secret,
        token,
        isDatabaseReferenced: true,
        now: 1_000_000,
      }),
    ).toBe(false);
  });
});
