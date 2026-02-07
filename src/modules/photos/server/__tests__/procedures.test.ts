import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAuthedCaller, buildPhotoInput } from "@/test/helpers";
import { db } from "@/db";
import { photos, citySets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSession } from "@/modules/auth/lib/get-session";

// Clean up test data before each test
beforeEach(async () => {
  await db.delete(citySets);
  await db.delete(photos);
});

describe("photos.create", () => {
  it("should insert a photo and return it", async () => {
    const caller = createAuthedCaller();
    const input = buildPhotoInput();

    const result = await caller.photos.create(input);

    expect(result).toBeDefined();
    expect(result.title).toBe("Test Photo");
    expect(result.url).toBe("photos/test-photo.jpg");
    expect(result.id).toBeDefined();
  });

  it("should create a city set when photo has location data", async () => {
    const caller = createAuthedCaller();
    const input = buildPhotoInput({
      country: "United States",
      countryCode: "US",
      city: "New York",
      region: "New York",
    });

    await caller.photos.create(input);

    // Verify city set was created
    const [citySet] = await db
      .select()
      .from(citySets)
      .where(eq(citySets.city, "New York"));

    expect(citySet).toBeDefined();
    expect(citySet.country).toBe("United States");
    expect(citySet.photoCount).toBe(1);
  });

  it("should increment city set photo count for same city", async () => {
    const caller = createAuthedCaller();
    const baseInput = {
      country: "United States",
      countryCode: "US",
      city: "New York",
      region: "New York",
    };

    await caller.photos.create(
      buildPhotoInput({ ...baseInput, title: "Photo 1" }),
    );
    await caller.photos.create(
      buildPhotoInput({ ...baseInput, title: "Photo 2" }),
    );

    const [citySet] = await db
      .select()
      .from(citySets)
      .where(eq(citySets.city, "New York"));

    expect(citySet.photoCount).toBe(2);
  });

  it("should use region as city name for JP country code", async () => {
    const caller = createAuthedCaller();
    const input = buildPhotoInput({
      country: "Japan",
      countryCode: "JP",
      city: "Shibuya",
      region: "Tokyo",
    });

    await caller.photos.create(input);

    const [citySet] = await db
      .select()
      .from(citySets)
      .where(eq(citySets.city, "Tokyo"));

    expect(citySet).toBeDefined();
    expect(citySet.city).toBe("Tokyo");
  });

  it("should not create city set when no location data", async () => {
    const caller = createAuthedCaller();
    const input = buildPhotoInput();

    await caller.photos.create(input);

    const allCitySets = await db.select().from(citySets);
    expect(allCitySets).toHaveLength(0);
  });

  it("should reject unauthenticated requests", async () => {
    // Override getSession to return null (unauthenticated)
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const caller = createAuthedCaller();
    const input = buildPhotoInput();

    await expect(caller.photos.create(input)).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("photos.update", () => {
  it("should update photo fields and updatedAt", async () => {
    const caller = createAuthedCaller();
    const photo = await caller.photos.create(buildPhotoInput());

    const updated = await caller.photos.update({
      id: photo.id,
      title: "Updated Title",
    });

    expect(updated.title).toBe("Updated Title");
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(photo.updatedAt).getTime(),
    );
  });

  it("should return NOT_FOUND for non-existent photo", async () => {
    const caller = createAuthedCaller();

    await expect(
      caller.photos.update({
        id: "00000000-0000-0000-0000-000000000000",
        title: "Nope",
      }),
    ).rejects.toThrow("NOT_FOUND");
  });
});

describe("photos.getOne", () => {
  it("should return a photo by id", async () => {
    const caller = createAuthedCaller();
    const created = await caller.photos.create(buildPhotoInput());

    const photo = await caller.photos.getOne({ id: created.id });

    expect(photo).toBeDefined();
    expect(photo.id).toBe(created.id);
  });
});

describe("photos.getMany", () => {
  it("should return paginated results", async () => {
    const caller = createAuthedCaller();

    // Create 3 photos
    for (let i = 0; i < 3; i++) {
      await caller.photos.create(
        buildPhotoInput({
          title: `Photo ${i}`,
          dateTimeOriginal: new Date(2024, 0, i + 1),
        }),
      );
    }

    const result = await caller.photos.getMany({ page: 1, pageSize: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it("should filter by search term", async () => {
    const caller = createAuthedCaller();
    await caller.photos.create(buildPhotoInput({ title: "Sunset Beach" }));
    await caller.photos.create(buildPhotoInput({ title: "Mountain View" }));

    const result = await caller.photos.getMany({ search: "sunset" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Sunset Beach");
  });

  it("should escape LIKE wildcards in search", async () => {
    const caller = createAuthedCaller();
    await caller.photos.create(buildPhotoInput({ title: "100% Pure" }));
    await caller.photos.create(buildPhotoInput({ title: "100 Days" }));

    // Search for literal "100%" — should only match "100% Pure", not "100 Days"
    const result = await caller.photos.getMany({ search: "100%" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("100% Pure");
  });
});

describe("photos.remove", () => {
  it("should delete a photo", async () => {
    const caller = createAuthedCaller();
    const photo = await caller.photos.create(buildPhotoInput());

    const deleted = await caller.photos.remove({ id: photo.id });
    expect(deleted.id).toBe(photo.id);

    // Verify it's gone
    const found = await caller.photos.getOne({ id: photo.id });
    expect(found).toBeUndefined();
  });

  it("should delete city set when last photo is removed", async () => {
    const caller = createAuthedCaller();
    const photo = await caller.photos.create(
      buildPhotoInput({
        country: "France",
        countryCode: "FR",
        city: "Paris",
        region: "Île-de-France",
      }),
    );

    await caller.photos.remove({ id: photo.id });

    const allCitySets = await db
      .select()
      .from(citySets)
      .where(eq(citySets.city, "Paris"));

    expect(allCitySets).toHaveLength(0);
  });

  it("should decrement city set count when non-cover photo removed", async () => {
    const caller = createAuthedCaller();

    const photo1 = await caller.photos.create(
      buildPhotoInput({
        title: "Photo 1",
        country: "France",
        countryCode: "FR",
        city: "Paris",
        region: "Île-de-France",
      }),
    );

    const photo2 = await caller.photos.create(
      buildPhotoInput({
        title: "Photo 2",
        country: "France",
        countryCode: "FR",
        city: "Paris",
        region: "Île-de-France",
      }),
    );

    // Remove the second photo (not the cover)
    await caller.photos.remove({ id: photo2.id });

    const [citySet] = await db
      .select()
      .from(citySets)
      .where(eq(citySets.city, "Paris"));

    expect(citySet.photoCount).toBe(1);
    expect(citySet.coverPhotoId).toBe(photo1.id);
  });

  it("should return NOT_FOUND for non-existent photo", async () => {
    const caller = createAuthedCaller();

    await expect(
      caller.photos.remove({ id: "00000000-0000-0000-0000-000000000000" }),
    ).rejects.toThrow("Photo not found");
  });
});
