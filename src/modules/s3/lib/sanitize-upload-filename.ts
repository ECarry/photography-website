const MAX_FILENAME_LENGTH = 120;

export function sanitizeUploadFilename(filename: string): string {
  const basename = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, MAX_FILENAME_LENGTH);

  return sanitized || "upload";
}
