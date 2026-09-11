import { describe, expect, it } from "vitest";
import { postFormSchema } from "../schemas";
import { generateSlug } from "../lib/utils";

const post = { title: "A story", slug: "a-story", visibility: "private", tags: [] };

describe("post editor validation", () => {
  it("rejects a blank title", () => {
    expect(postFormSchema.safeParse({ ...post, title: "   " }).success).toBe(false);
  });

  it.each(["two words", "story/path", "story?preview", "story#section", "../story"])(
    "rejects an unsafe URL slug: %s",
    (slug) => {
      expect(postFormSchema.safeParse({ ...post, slug }).success).toBe(false);
    },
  );

  it("supports Chinese titles and URL slugs", () => {
    const title = "京都 摄影日记";
    const slug = generateSlug(title);
    expect(slug).toBe("京都-摄影日记");
    expect(postFormSchema.safeParse({ ...post, title, slug }).success).toBe(true);
  });

  it("trims titles and slugs without changing a custom slug", () => {
    const result = postFormSchema.parse({ ...post, title: " Updated title ", slug: " my-custom_slug " });
    expect(result.title).toBe("Updated title");
    expect(result.slug).toBe("my-custom_slug");
  });
});
