import { describe, expect, it } from "vitest";
import { computeSpec } from "./stairs";

describe("computeSpec", () => {
  it("divides floor-to-floor height evenly across steps", () => {
    expect(computeSpec({ steps: 15, height: 3, width: 1, going: 0.27 }).riserMm).toBe(200);
  });
  it("total run is steps times going", () => {
    expect(computeSpec({ steps: 15, height: 3, width: 1, going: 0.27 }).runMm).toBe(4050);
  });
  it("flags steep stairs as uncomfortable", () => {
    expect(computeSpec({ steps: 8, height: 3, width: 1, going: 0.22 }).comfortable).toBe(false);
  });
});

import { mountingPoints as mp, slideAlongWall as slide } from "./stairs";
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("wall mounting", () => {
  const p = { steps: 15, height: 3, width: 1, going: 0.27 };
  i2("cantilever gets one 4-bolt wall bracket per tread, no floor shoe", () => {
    const a = mp(p, "cantilever", false);
    e2(a.filter((x) => x.kind === "wall").length).toBe(15);
    e2(a.every((x) => x.bolts === 4)).toBe(true);
    e2(a.some((x) => x.kind === "floor")).toBe(false);
  });
  i2("free-standing mono has only floor shoe and slab plate", () => {
    e2(mp(p, "mono", false).map((x) => x.kind)).toEqual(["floor", "slab"]);
  });
  i2("sliding along wall at 0 rotation only changes x", () => {
    const r = slide({ x: 0, y: -0.5, z: 1, scale: 1, rotY: 0, tilt: 0 }, 0.5);
    e2(r.x).toBeCloseTo(0.5); e2(r.z).toBeCloseTo(1); e2(r.y).toBe(-0.5);
  });
});

import { calibratedScale } from "./stairs";
d2("real-scale calibration", () => {
  const viewH = 2 * Math.tan((45 * Math.PI) / 360) * 7;
  i2("reference spanning the full view height equal to view metres gives scale 1", () => {
    e2(calibratedScale({ a: { x: 0.5, y: 0 }, b: { x: 0.5, y: 1 }, meters: viewH, aspect: 1 }, 0)).toBeCloseTo(1);
  });
  i2("same pixel line measured as twice the distance halves the scale", () => {
    const c = { a: { x: 0.5, y: 0.2 }, b: { x: 0.5, y: 0.8 }, meters: 2, aspect: 1.5 };
    e2(calibratedScale({ ...c, meters: 4 }, 0)).toBeCloseTo(calibratedScale(c, 0) / 2);
  });
});

import { fitScale } from "./imports";
d2("imported model fitting", () => {
  i2("a 2m-long tread fitted to 1m width scales that axis by 0.5", () => {
    e2(fitScale([0.3, 0.06, 2], [0.3, 0.06, 1])).toEqual([1, 1, 0.5]);
  });
});
