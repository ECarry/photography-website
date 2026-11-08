import { describe, expect, it } from "vitest";
import { serializeJsonLd, toSeoDescription } from "@/lib/seo";

describe("SEO helpers", () => {
  it("escapes script-closing characters in JSON-LD", () => {
    const result = serializeJsonLd({
      description: "</script><script>alert(1)</script>",
    });

    expect(result).not.toContain("</script>");
    expect(result).toContain("\\u003c/script>");
  });

  it("strips markup and truncates meta descriptions", () => {
    expect(toSeoDescription("<p>A &amp; B</p>", "fallback")).toBe("A & B");
    expect(toSeoDescription("x".repeat(180), "fallback")).toHaveLength(160);
  });
});
