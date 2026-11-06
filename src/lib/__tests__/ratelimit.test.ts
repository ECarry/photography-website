import { describe, expect, it } from "vitest";
import { parseClientIp } from "@/lib/ratelimit";

function headerGetter(headers: Record<string, string>) {
  return (name: string) => headers[name] ?? null;
}

describe("parseClientIp", () => {
  it("returns the first IP from x-forwarded-for", () => {
    expect(
      parseClientIp(
        headerGetter({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" }),
      ),
    ).toBe("203.0.113.5");
  });

  it("trims whitespace around the forwarded IP", () => {
    expect(
      parseClientIp(headerGetter({ "x-forwarded-for": "  203.0.113.5  " })),
    ).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", () => {
    expect(parseClientIp(headerGetter({ "x-real-ip": "198.51.100.7" }))).toBe(
      "198.51.100.7",
    );
  });

  it("falls back to x-real-ip when x-forwarded-for is empty", () => {
    expect(
      parseClientIp(
        headerGetter({ "x-forwarded-for": "", "x-real-ip": "198.51.100.7" }),
      ),
    ).toBe("198.51.100.7");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    expect(parseClientIp(headerGetter({}))).toBe("unknown");
  });
});
