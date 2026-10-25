const photoDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPhotoDate(date: Date): string {
  return photoDateFormatter.format(date);
}
