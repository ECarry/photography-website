import { describe, expect, it } from "vitest";
import { getCitySetName } from "@/modules/photos/server/city-set-sync";

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
});
