import { describe, expect, it } from "vitest";
import { canRegisterFirstUser } from "../lib/registration-policy";

describe("canRegisterFirstUser", () => {
  it("allows registration when the user table is empty", () => {
    expect(canRegisterFirstUser(0)).toBe(true);
  });

  it("locks registration once a user exists", () => {
    expect(canRegisterFirstUser(1)).toBe(false);
    expect(canRegisterFirstUser(12)).toBe(false);
  });
});
