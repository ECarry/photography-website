import { describe, expect, it } from "vitest";
import {
  capDiscoverMapPoints,
  DISCOVER_MAP_POINT_LIMIT,
} from "../photo-payload";

describe("capDiscoverMapPoints", () => {
  it("keeps map payloads at or below the point limit", () => {
    const rows = Array.from({ length: DISCOVER_MAP_POINT_LIMIT + 1 }, (_, id) => ({
      id,
    }));

    const result = capDiscoverMapPoints(rows);

    expect(result.photos).toHaveLength(DISCOVER_MAP_POINT_LIMIT);
    expect(result.hasMore).toBe(true);
  });

  it("does not report more results when all points fit", () => {
    const rows = [{ id: 1 }, { id: 2 }];

    expect(capDiscoverMapPoints(rows)).toEqual({
      photos: rows,
      hasMore: false,
    });
  });
});
