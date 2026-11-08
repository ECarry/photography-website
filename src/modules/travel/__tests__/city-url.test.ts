import { describe, expect, it } from "vitest";
import {
  getTravelCityPath,
  getTravelCitySetId,
} from "@/modules/travel/city-url";

describe("getTravelCityPath", () => {
  it("includes a stable city-set ID to disambiguate city names", () => {
    expect(
      getTravelCityPath(
        "6d25a2f4-12cd-4d8a-a045-1bb56dab83ac",
        "Tokyo",
      ),
    ).toBe("/travel/Tokyo--6d25a2f4-12cd-4d8a-a045-1bb56dab83ac");
  });

  it("encodes city names as one route segment", () => {
    expect(
      getTravelCityPath(
        "6d25a2f4-12cd-4d8a-a045-1bb56dab83ac",
        "New York",
      ),
    ).toBe("/travel/New-York--6d25a2f4-12cd-4d8a-a045-1bb56dab83ac");
    expect(
      getTravelCityPath(
        "6d25a2f4-12cd-4d8a-a045-1bb56dab83ac",
        "San/Francisco",
      ),
    ).toBe("/travel/San-Francisco--6d25a2f4-12cd-4d8a-a045-1bb56dab83ac");
  });

  it("parses the city-set ID suffix without depending on the city slug", () => {
    expect(
      getTravelCitySetId(
        "Tokyo--6d25a2f4-12cd-4d8a-a045-1bb56dab83ac",
      ),
    ).toBe("6d25a2f4-12cd-4d8a-a045-1bb56dab83ac");
    expect(getTravelCitySetId("Tokyo")).toBeNull();
  });
});
