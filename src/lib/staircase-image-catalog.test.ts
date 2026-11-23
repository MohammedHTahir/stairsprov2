import { describe, expect, it } from 'vitest';
import {
  parseStaircaseImagePath,
  selectStaircaseImage,
  type StaircaseImage,
  type StaircaseConfiguration,
} from './staircase-image-catalog';

const config: StaircaseConfiguration = {
  layout: 'straight',
  wood: 'natural-oak',
  glass: 'with-glass',
  metal: 'matte-black',
  support: 'central-spine',
  stepCount: 15,
};

function image(overrides: Partial<StaircaseImage> = {}): StaircaseImage {
  return {
    id: 'straight/natural-oak/with-glass/matte-black/central-spine/15-steps/a.webp',
    title: 'A',
    imageUrl: '/a.webp',
    ...config,
    ...overrides,
  };
}

describe('staircase image path metadata', () => {
  it('reads configuration from the documented folder structure', () => {
    const result = parseStaircaseImagePath(
      '/src/assets/stairs/spiral/walnut/without-glass/anthracite/side-stringer/16-steps/spiral-01.webp',
      '/assets/spiral-01.webp',
    );
    expect(result).toMatchObject({
      layout: 'spiral',
      wood: 'walnut',
      glass: 'without-glass',
      metal: 'anthracite',
      support: 'side-stringer',
      stepCount: 16,
      title: 'Spiral 01',
    });
  });

  it('ignores assets that do not follow the supported folder convention', () => {
    expect(parseStaircaseImagePath('/src/assets/stairs/straight/random.webp', '/random.webp')).toBeNull();
  });
});

describe('staircase image matching', () => {
  it('returns an exact match when one is available', () => {
    const exact = image();
    const other = image({ id: 'other.webp', wood: 'walnut' });
    expect(selectStaircaseImage(config, [other, exact], () => 0)?.image).toBe(exact);
    expect(selectStaircaseImage(config, [exact], () => 0)?.exact).toBe(true);
  });

  it('never returns a different staircase layout', () => {
    const spiral = image({ layout: 'spiral' });
    expect(selectStaircaseImage(config, [spiral])).toBeNull();
  });

  it('falls back to the closest matching configuration within the same layout', () => {
    const close = image({ id: 'close.webp', stepCount: 16 });
    const poor = image({ id: 'poor.webp', wood: 'dark-walnut', glass: 'without-glass', metal: 'brushed-steel', support: 'side-stringer', stepCount: 20 });
    expect(selectStaircaseImage(config, [poor, close])?.image).toBe(close);
    expect(selectStaircaseImage(config, [close])?.exact).toBe(false);
  });

  it('randomly selects between equally scored candidates', () => {
    const first = image({ id: 'first.webp' });
    const second = image({ id: 'second.webp' });
    expect(selectStaircaseImage(config, [first, second], () => 0)?.image).toBe(first);
    expect(selectStaircaseImage(config, [first, second], () => 0.99)?.image).toBe(second);
  });
});
