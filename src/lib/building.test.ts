import { describe, expect, it } from 'vitest';
import { buildFlights } from './building';

describe('multi-floor stair', () => {
  it('connects 3 storeys with 2 flights per storey', () => {
    expect(buildFlights(3, 3.2)).toHaveLength(4);
  });
  it('last flight reaches the top floor', () => {
    const f = buildFlights(3, 3.2).at(-1)!;
    expect(f.y + f.rise).toBeCloseTo(6.4);
  });
  it('flights alternate direction (switchback)', () => {
    expect(buildFlights(2, 3).map(f => f.dir)).toEqual([1, -1]);
  });
});
