import { describe, expect, it } from "vitest";
import { expandViewportBounds } from "../viewport-bounds";

describe("expandViewportBounds", () => {
  it("adds a buffer around a normal viewport", () => {
    expect(
      expandViewportBounds({
        west: -10,
        south: -5,
        east: 10,
        north: 5,
      }),
    ).toEqual({
      west: -14,
      south: -7,
      east: 14,
      north: 7,
    });
  });

  it("keeps a viewport crossing the antimeridian wrapped", () => {
    expect(
      expandViewportBounds({
        west: 170,
        south: -5,
        east: -170,
        north: 5,
      }),
    ).toEqual({
      west: 166,
      south: -7,
      east: -166,
      north: 7,
    });
  });

  it("uses global longitude bounds when the padded viewport spans the world", () => {
    expect(
      expandViewportBounds({
        west: -170,
        south: -80,
        east: 170,
        north: 80,
      }),
    ).toEqual({
      west: -180,
      south: -85,
      east: 180,
      north: 85,
    });
  });
});
