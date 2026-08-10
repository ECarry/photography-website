export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}
