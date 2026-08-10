import { beforeEach, describe, expect, it } from "vitest";
import { createAuthedCaller } from "@/test/helpers";
import { db } from "@/db";
import { posts } from "@/db/schema";

beforeEach(async () => {
  await db.delete(posts);
});

describe("posts.getMany", () => {
  it("should escape LIKE wildcards in search", async () => {
    const caller = createAuthedCaller();

    await caller.posts.create({
      title: "100% Pure",
      slug: "100-percent-pure",
    });
    await caller.posts.create({
      title: "100 Days",
      slug: "100-days",
    });

    const result = await caller.posts.getMany({ search: "100%" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("100% Pure");
  });
});
