import { describe, expect, test } from "vitest";
import { authDestination, normalizeJoinCode } from "./onboarding";

describe("normalizeJoinCode", () => {
  test("normalizes pasted join codes", () => {
    expect(normalizeJoinCode("  lib-ab12-cd34  ")).toBe("LIB-AB12-CD34");
  });
});

describe("authDestination", () => {
  test("sends users without an organization to join", () => {
    expect(authDestination(null)).toBe("/join");
  });

  test("sends organization members to library", () => {
    expect(authDestination("org_123")).toBe("/library");
  });
});
