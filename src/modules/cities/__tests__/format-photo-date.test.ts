import { describe, expect, it } from "vitest";
import { formatPhotoDate } from "../format-photo-date";

describe("formatPhotoDate", () => {
  it("formats dates in UTC to avoid server/client timezone differences", () => {
    expect(formatPhotoDate(new Date("2024-03-01T00:30:00.000Z"))).toBe(
      "1 Mar 2024",
    );
  });
});
