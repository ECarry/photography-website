import { beforeEach, describe, expect, it } from "vitest";
import { createAuthedCaller } from "@/test/helpers";
import { db } from "@/db";
import { posts } from "@/db/schema";

beforeEach(async () => {
  await db.delete(posts);
});

describe("posts.create", () => {
  it("should reject duplicate slugs with a client error", async () => {
    const caller = createAuthedCaller();
    const post = {
      title: "First Post",
      slug: "duplicate-slug",
    };

    await caller.posts.create(post);

    await expect(caller.posts.create({ ...post, title: "Second Post" })).rejects.toThrow(
      "Post with this slug already exists",
    );
  });
});

describe("posts.update", () => {
  it("should reject changing to an existing slug", async () => {
    const caller = createAuthedCaller();
    const firstPost = await caller.posts.create({
      title: "First Post",
      slug: "first-post",
    });

    await caller.posts.create({
      title: "Second Post",
      slug: "second-post",
    });

    await expect(
      caller.posts.update({ id: firstPost.id, slug: "second-post" }),
    ).rejects.toThrow("Post with this slug already exists");
  });
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
