import { createHmac, timingSafeEqual } from "node:crypto";
import { ALLOWED_UPLOAD_FOLDERS } from "@/constants";

export const PENDING_UPLOAD_DELETE_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

interface DeleteTokenOptions {
  key: string;
  userId: string;
  secret: string;
  expiresAt?: number;
}

interface VerifyDeleteTokenOptions extends DeleteTokenOptions {
  token: string;
  now?: number;
}

export function isAllowedS3ObjectKey(key: string): boolean {
  if (key.length === 0 || key.length > 512) return false;

  const [folder, ...objectPath] = key.split("/");
  return (
    ALLOWED_UPLOAD_FOLDERS.includes(
      folder as (typeof ALLOWED_UPLOAD_FOLDERS)[number],
    ) &&
    objectPath.length > 0 &&
    objectPath.every(
      (segment) =>
        segment !== "" &&
        segment !== "." &&
        segment !== ".." &&
        /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment),
    )
  );
}

function getSignature(
  key: string,
  userId: string,
  expiresAt: number,
  secret: string,
) {
  return createHmac("sha256", secret)
    .update(`${userId}\n${key}\n${expiresAt}`)
    .digest();
}

export function createPendingUploadDeleteToken({
  key,
  userId,
  secret,
  expiresAt = Date.now() + PENDING_UPLOAD_DELETE_TOKEN_TTL_MS,
}: DeleteTokenOptions): string {
  return `${expiresAt}.${getSignature(key, userId, expiresAt, secret).toString("hex")}`;
}

export function verifyPendingUploadDeleteToken({
  key,
  userId,
  secret,
  token,
  now = Date.now(),
}: VerifyDeleteTokenOptions): boolean {
  const [expiresAtValue, signatureValue, ...extraParts] = token.split(".");
  if (
    extraParts.length > 0 ||
    !/^\d+$/.test(expiresAtValue ?? "") ||
    !/^[a-f0-9]{64}$/i.test(signatureValue ?? "")
  ) {
    return false;
  }

  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;

  const expectedSignature = getSignature(key, userId, expiresAt, secret);
  const suppliedSignature = Buffer.from(signatureValue, "hex");
  return (
    suppliedSignature.length === expectedSignature.length &&
    timingSafeEqual(suppliedSignature, expectedSignature)
  );
}

export function canDeleteS3Object({
  key,
  userId,
  secret,
  token,
  isDatabaseReferenced,
  now,
}: VerifyDeleteTokenOptions & { isDatabaseReferenced: boolean }): boolean {
  if (!isAllowedS3ObjectKey(key)) return false;
  if (isDatabaseReferenced) return true;
  if (!token) return false;

  return verifyPendingUploadDeleteToken({
    key,
    userId,
    secret,
    token,
    now,
  });
}
