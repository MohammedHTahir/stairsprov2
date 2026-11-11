import { describe, expect, it } from "vitest";
import { captureProgress } from "./capture-photos";

describe("captureProgress", () => {
  it("requires at least 12 photos", () => {
    expect(captureProgress(11)).toEqual({ ready: false, label: "1 more needed" });
    expect(captureProgress(12).ready).toBe(true);
  });
  it("reports great coverage at 24", () => {
    expect(captureProgress(24).label).toBe("Great coverage");
  });
});
