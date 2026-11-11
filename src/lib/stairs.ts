export type Structure = "mono" | "twin" | "cantilever";

export type StairParams = { steps: number; height: number; width: number; going: number };
export type Placement = { x: number; y: number; z: number; scale: number; rotY: number; tilt: number };
export type Finishes = { tread: TreadKey; glass: GlassKey; structure: StructureKey };

export const TREADS = {
  oak: { label: "Natural oak", color: "#c09062", roughness: 0.55 },
  walnut: { label: "Smoked walnut", color: "#6b4630", roughness: 0.5 },
  ash: { label: "White ash", color: "#e2cfb2", roughness: 0.6 },
  concrete: { label: "Micro-concrete", color: "#b7b2aa", roughness: 0.9 },
} as const;
export const GLASS = {
  clear: { label: "Clear", color: "#dcebe8", opacity: 0.2, roughness: 0.03 },
  lowiron: { label: "Low-iron", color: "#f4fbfb", opacity: 0.14, roughness: 0.02 },
  bronze: { label: "Bronze tint", color: "#8a6a4a", opacity: 0.32, roughness: 0.04 },
  frosted: { label: "Satin frosted", color: "#f2f2ef", opacity: 0.6, roughness: 0.45 },
} as const;
export const STRUCTURES = {
  black: { label: "Matte black steel", color: "#1e1e1f", metalness: 0.55, roughness: 0.4 },
  bronze: { label: "Brushed bronze", color: "#7a5a3a", metalness: 0.85, roughness: 0.32 },
  white: { label: "Powder white", color: "#efede8", metalness: 0.2, roughness: 0.55 },
} as const;
export type TreadKey = keyof typeof TREADS;
export type GlassKey = keyof typeof GLASS;
export type StructureKey = keyof typeof STRUCTURES;

export type Design = {
  id: string;
  name: string;
  tagline: string;
  structure: Structure;
  params: StairParams;
  finishes: Finishes;
};

export const DESIGNS: Design[] = [
  {
    id: "oak-mono",
    name: "Oak Mono",
    tagline: "Floating oak treads, black mono-stringer, frameless glass",
    structure: "mono",
    params: { steps: 15, height: 3.0, width: 1.0, going: 0.27 },
    finishes: { tread: "oak", glass: "lowiron", structure: "black" },
  },
  {
    id: "walnut-cantilever",
    name: "Walnut Cantilever",
    tagline: "Wall-anchored treads with no visible structure",
    structure: "cantilever",
    params: { steps: 16, height: 3.1, width: 0.95, going: 0.26 },
    finishes: { tread: "walnut", glass: "clear", structure: "black" },
  },
  {
    id: "ash-twin",
    name: "Ash Twin Plate",
    tagline: "Slim twin plate stringers, pale ash, airy balustrade",
    structure: "twin",
    params: { steps: 14, height: 2.8, width: 1.1, going: 0.28 },
    finishes: { tread: "ash", glass: "lowiron", structure: "white" },
  },
  {
    id: "concrete-float",
    name: "Concrete Float",
    tagline: "Monolithic concrete blocks on a bronze spine",
    structure: "mono",
    params: { steps: 15, height: 3.0, width: 1.2, going: 0.29 },
    finishes: { tread: "concrete", glass: "bronze", structure: "bronze" },
  },
];

export const getDesign = (id: string) => DESIGNS.find((d) => d.id === id) ?? DESIGNS[0]!;

export function computeSpec(p: StairParams) {
  const riser = p.height / p.steps;
  const run = p.steps * p.going;
  const pitch = (Math.atan2(p.height, run) * 180) / Math.PI;
  const blondel = 2 * riser + p.going; // comfort rule, metres
  return {
    riserMm: Math.round(riser * 1000),
    goingMm: Math.round(p.going * 1000),
    runMm: Math.round(run * 1000),
    heightMm: Math.round(p.height * 1000),
    widthMm: Math.round(p.width * 1000),
    stringerMm: Math.round(Math.hypot(run, p.height) * 1000),
    pitchDeg: Math.round(pitch * 10) / 10,
    blondelMm: Math.round(blondel * 1000),
    comfortable: blondel >= 0.55 && blondel <= 0.7 && pitch <= 42,
  };
}

export const DEFAULT_PLACEMENT: Placement = { x: 0, y: -0.5, z: 0, scale: 0.8, rotY: -0.4, tilt: 8 };

/** Wall mounting: staircase's back edge sits against a wall plane with a shadow gap (metres). */
export type Mounting = { wall: boolean; gap: number; showWall: boolean };
export const DEFAULT_MOUNTING: Mounting = { wall: true, gap: 0.02, showWall: true };

export type Anchor = { kind: "wall" | "floor" | "slab"; x: number; y: number; bolts: number };

/** Structural fixing points in stair-local metres (x along run from first nosing, y up). */
export function mountingPoints(p: StairParams, structure: Structure, wall: boolean): Anchor[] {
  const riser = p.height / p.steps;
  const anchors: Anchor[] = [];
  if (structure === "cantilever" || wall) {
    for (let i = 0; i < p.steps; i++) {
      anchors.push({ kind: "wall", x: i * p.going + p.going / 2, y: (i + 1) * riser, bolts: structure === "cantilever" ? 4 : 2 });
    }
  }
  if (structure !== "cantilever") {
    anchors.push({ kind: "floor", x: 0, y: 0, bolts: 4 });
    anchors.push({ kind: "slab", x: p.steps * p.going, y: p.height, bolts: 4 });
  }
  return anchors;
}

/** Slide a placement along the wall it is snapped to (stair local x axis). */
export function slideAlongWall(pl: Placement, d: number): Placement {
  return { ...pl, x: pl.x + d * Math.cos(pl.rotY), z: pl.z - d * Math.sin(pl.rotY) };
}

/** Two points tapped on the photo (fractions of stage size) and the real distance between them. */
export type Calibration = { a: { x: number; y: number }; b: { x: number; y: number }; meters: number; aspect: number };
export const CAMERA_Z = 7;
export const CAMERA_FOV = 45;

/**
 * Scale that renders 1 model metre at true size, assuming the reference
 * line stands at the staircase's depth. aspect = stage width / height.
 */
export function calibratedScale(c: Calibration, stairZ: number): number {
  const dx = (c.b.x - c.a.x) * c.aspect;
  const dy = c.b.y - c.a.y;
  const frac = Math.hypot(dx, dy); // reference length as fraction of stage height
  const dist = Math.max(0.5, CAMERA_Z - stairZ);
  const viewH = 2 * Math.tan((CAMERA_FOV * Math.PI) / 360) * dist; // world metres visible vertically
  return (frac * viewH) / c.meters;
}
