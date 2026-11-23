export type StairLayout = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral' | 'cantilevered';
export type WoodFinish = 'light-oak' | 'natural-oak' | 'walnut' | 'dark-walnut';
export type GlassOption = 'with-glass' | 'without-glass';
export type MetalFinish = 'matte-black' | 'anthracite' | 'brushed-steel';
export type SupportStyle = 'central-spine' | 'side-stringer' | 'cantilevered';

export type StaircaseConfiguration = {
  layout: StairLayout;
  wood: WoodFinish;
  glass: GlassOption;
  metal: MetalFinish;
  support: SupportStyle;
  stepCount: number;
};

export type StaircaseImage = StaircaseConfiguration & {
  id: string;
  title: string;
  imageUrl: string;
};

export type StaircaseImageMatch = {
  image: StaircaseImage;
  score: number;
  exact: boolean;
};

const imageModules = import.meta.glob('/src/assets/stairs/**/*.{avif,gif,jpeg,jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const layouts = new Set<StairLayout>(['straight', 'l-shaped', 'u-shaped', 'spiral', 'cantilevered']);
const woods = new Set<WoodFinish>(['light-oak', 'natural-oak', 'walnut', 'dark-walnut']);
const glassOptions = new Set<GlassOption>(['with-glass', 'without-glass']);
const metals = new Set<MetalFinish>(['matte-black', 'anthracite', 'brushed-steel']);
const supports = new Set<SupportStyle>(['central-spine', 'side-stringer', 'cantilevered']);

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

/**
 * Expected asset path:
 * src/assets/stairs/<layout>/<wood>/<glass>/<metal>/<support>/<step-count>/<image>
 */
export function parseStaircaseImagePath(path: string, imageUrl: string): StaircaseImage | null {
  const marker = '/stairs/';
  const markerIndex = path.lastIndexOf(marker);
  if (markerIndex < 0) return null;

  const parts = path.slice(markerIndex + marker.length).split('/');
  if (parts.length !== 7) return null;

  const [layout, wood, glass, metal, support, stepFolder, filename] = parts;
  const stepCount = /^(\d+)(?:-steps?)?$/.exec(stepFolder ?? '');
  if (
    !layouts.has(layout as StairLayout) ||
    !woods.has(wood as WoodFinish) ||
    !glassOptions.has(glass as GlassOption) ||
    !metals.has(metal as MetalFinish) ||
    !supports.has(support as SupportStyle) ||
    !stepCount ||
    !filename
  ) return null;

  return {
    id: parts.join('/'),
    title: titleFromFilename(filename),
    imageUrl,
    layout: layout as StairLayout,
    wood: wood as WoodFinish,
    glass: glass as GlassOption,
    metal: metal as MetalFinish,
    support: support as SupportStyle,
    stepCount: Number(stepCount[1]),
  };
}

export const STAIRCASE_IMAGE_CATALOG: StaircaseImage[] = Object.entries(imageModules)
  .map(([path, imageUrl]) => parseStaircaseImagePath(path, imageUrl))
  .filter((image): image is StaircaseImage => image !== null);

export function scoreStaircaseImage(image: StaircaseImage, config: StaircaseConfiguration) {
  if (image.layout !== config.layout) return -1;

  let score = 0;
  if (image.wood === config.wood) score += 30;
  if (image.glass === config.glass) score += 25;
  if (image.metal === config.metal) score += 20;
  if (image.support === config.support) score += 15;

  // Exact step counts receive all 10 points. Nearby counts remain eligible,
  // but lose two points for every additional step of difference.
  score += Math.max(0, 10 - Math.abs(image.stepCount - config.stepCount) * 2);
  return score;
}

/**
 * Finds the best-scoring image within the requested layout, then randomly
 * chooses among equally good candidates. The random function is injectable
 * so selection behavior can be tested without flaky tests.
 */
export function selectStaircaseImage(
  config: StaircaseConfiguration,
  catalog: readonly StaircaseImage[] = STAIRCASE_IMAGE_CATALOG,
  random: () => number = Math.random,
): StaircaseImageMatch | null {
  const ranked = catalog
    .map(image => ({ image, score: scoreStaircaseImage(image, config) }))
    .filter(candidate => candidate.score >= 0);

  if (ranked.length === 0) return null;

  const bestScore = Math.max(...ranked.map(candidate => candidate.score));
  const bestCandidates = ranked.filter(candidate => candidate.score === bestScore);
  const randomValue = Math.min(0.999999999, Math.max(0, random()));
  const selected = bestCandidates[Math.floor(randomValue * bestCandidates.length)]!;

  return {
    ...selected,
    exact: selected.image.wood === config.wood
      && selected.image.glass === config.glass
      && selected.image.metal === config.metal
      && selected.image.support === config.support
      && selected.image.stepCount === config.stepCount,
  };
}
