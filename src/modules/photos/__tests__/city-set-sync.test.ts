import { describe, expect, it } from "vitest";
import {
  getCitySetName,
  getCitySetPhotoNameColumn,
} from "@/modules/cities/city-set-location";
import { photos } from "@/db/schema";

describe("getCitySetName", () => {
  it.each(["JP", "TW"])(
    "uses region rather than city for %s photos",
    (countryCode) => {
      expect(
        getCitySetName({
          countryCode,
          city: "Other",
          region: "Tokyo",
        }),
      ).toBe("Tokyo");
    },
  );

  it("uses city for other countries", () => {
    expect(
      getCitySetName({
        countryCode: "US",
        city: "New York",
        region: "New York",
      }),
    ).toBe("New York");
  });

  it.each(["JP", "TW"])(
    "matches photo regions to city sets for %s",
    (countryCode) => {
      expect(getCitySetPhotoNameColumn(countryCode)).toBe(photos.region);
    },
  );

  it("matches the city column for other countries", () => {
    expect(getCitySetPhotoNameColumn("US")).toBe(photos.city);
  });
});
