import { describe, expect, it } from 'vitest';
import {
  parseStaircaseImagePath,
  selectStaircaseImage,
  type StaircaseImage,
  type StaircaseConfiguration,
} from './staircase-image-catalog';

const config: StaircaseConfiguration = {
  layout: 'straight',
  style: 'mono-stringer',
  wood: 'natural-oak',
  metal: 'matte-black',
  stepCount: 15,
  entryDirection: 'not-applicable',
  widthMm: 1000,
  treadDepthMm: 280,
};

function image(overrides: Partial<StaircaseImage> = {}): StaircaseImage {
  return {
    id: 'straight/natural-oak/matte-black/mono-stringer/not-applicable/15-steps/a.webp',
    title: 'A',
    imageUrl: 'https://cdn.example.com/a.webp',
    sourceUrl: 'https://example.com/a',
    layout: 'straight',
    style: 'mono-stringer',
    wood: 'natural-oak',
    metal: 'matte-black',
    stepCount: 15,
    entryDirection: 'not-applicable',
    openRiser: true,
    glassRailing: true,
    ...overrides,
  };
}

describe('staircase image path metadata', () => {
  it('reads layout, finish, style, entry and steps from folders', () => {
    const result = parseStaircaseImagePath(
      '/src/assets/stairs/spiral/walnut/anthracite/mono-stringer/not-applicable/16-steps/spiral-01.webp',
      '/assets/spiral-01.webp',
    );
    expect(result).toMatchObject({
      layout: 'spiral',
      wood: 'walnut',
      metal: 'anthracite',
      style: 'mono-stringer',
      stepCount: 16,
      title: 'Spiral 01',
      openRiser: true,
      glassRailing: true,
    });
  });

  it('ignores assets that do not follow the supported folder convention', () => {
    expect(parseStaircaseImagePath('/src/assets/stairs/straight/random.webp', '/random.webp')).toBeNull();
  });

  it('rejects unsupported layouts', () => {
    expect(parseStaircaseImagePath('/src/assets/stairs/cantilevered/walnut/matte-black/mono-stringer/not-applicable/15-steps/a.webp', '/a.webp')).toBeNull();
  });
});

describe('staircase image matching', () => {
  it('returns an exact match when one is available', () => {
    const exact = image();
    const other = image({ id: 'other.webp', wood: 'walnut' });
    expect(selectStaircaseImage(config, [other, exact], () => 0)?.image).toBe(exact);
    expect(selectStaircaseImage(config, [exact], () => 0)?.exact).toBe(true);
  });

  it('keeps straight stair landing counts as a hard match constraint', () => {
    const noLanding = image({ id: 'straight-no-landing.webp', landingCount: 0 });
    const oneLanding = image({ id: 'straight-one-landing.webp', landingCount: 1 });
    const twoLandings = image({ id: 'straight-two-landings.webp', landingCount: 2 });
    expect(selectStaircaseImage({ ...config, landingCount: 1 }, [noLanding, oneLanding, twoLandings])?.image).toBe(oneLanding);
    expect(selectStaircaseImage({ ...config, landingCount: 2 }, [noLanding, oneLanding, twoLandings])?.image).toBe(twoLandings);
    expect(selectStaircaseImage({ ...config, landingCount: 0 }, [oneLanding, twoLandings])).toBeNull();
  });

  it('rotates to another eligible image on the next Generate action', () => {
    const first = image({ id: 'first.webp', landingCount: 0 });
    const second = image({ id: 'second.webp', landingCount: 0 });
    const third = image({ id: 'third.webp', landingCount: 0 });
    const initial = selectStaircaseImage({ ...config, landingCount: 0 }, [first, second, third], () => 0);
    const next = selectStaircaseImage({ ...config, landingCount: 0 }, [first, second, third], () => 0, initial?.image.id);
    const nextAgain = selectStaircaseImage({ ...config, landingCount: 0 }, [first, second, third], () => 0, next?.image.id);
    expect(new Set([initial?.image.id, next?.image.id, nextAgain?.image.id]).size).toBe(3);
  });

  it('never returns a different staircase layout', () => {
    expect(selectStaircaseImage(config, [image({ layout: 'spiral' })])).toBeNull();
  });

  it('falls back to the closest style and finish within the same layout', () => {
    const close = image({ id: 'close.webp', stepCount: 16 });
    const poor = image({ id: 'poor.webp', wood: 'dark-walnut', metal: 'brushed-steel', style: 'zigzag', stepCount: 20 });
    expect(selectStaircaseImage(config, [poor, close])?.image).toBe(close);
    expect(selectStaircaseImage(config, [close])?.exact).toBe(false);
  });

  it('randomly selects between equally scored candidates', () => {
    const first = image({ id: 'first.webp' });
    const second = image({ id: 'second.webp' });
    expect(selectStaircaseImage(config, [first, second], () => 0)?.image).toBe(first);
    expect(selectStaircaseImage(config, [first, second], () => 0.99)?.image).toBe(second);
  });

  it('filters records without open risers or glass railings', () => {
    const closed = image({ openRiser: false as unknown as true });
    const noGlass = image({ glassRailing: false as unknown as true });
    expect(selectStaircaseImage(config, [closed, noGlass])).toBeNull();
  });
});
