// Multi-floor stair shaft layout: a switchback (two flights + mid landing) per storey.
export type StairSystem = 'spine' | 'sawtooth';
export type Flight = { floor: number; x: number; y: number; z: number; dir: 1 | -1; treads: number; riser: number; going: number; rise: number };

export const SHAFT = { run: 2.7, width: 1.0, landing: 1.1, gap: 0.1 } as const;
export const VOID = { x0: -SHAFT.run / 2, x1: SHAFT.run / 2 + SHAFT.landing, z0: 0, z1: SHAFT.width * 2 + SHAFT.gap } as const;

/** Risers per half-storey, aiming for a comfortable ~175 mm riser. */
export function risersFor(halfHeight: number) { return Math.max(3, Math.round(halfHeight / 0.175)); }

export function buildFlights(floors: number, floorHeight: number): Flight[] {
  const half = floorHeight / 2; const n = risersFor(half);
  const riser = half / n; const going = SHAFT.run / (n - 1);
  const out: Flight[] = [];
  for (let f = 0; f < floors - 1; f++) {
    const base = f * floorHeight;
    out.push({ floor: f, x: VOID.x0, y: base, z: SHAFT.width / 2, dir: 1, treads: n - 1, riser, going, rise: half });
    out.push({ floor: f, x: VOID.x0 + SHAFT.run, y: base + half, z: SHAFT.width * 1.5 + SHAFT.gap, dir: -1, treads: n - 1, riser, going, rise: half });
  }
  return out;
}
