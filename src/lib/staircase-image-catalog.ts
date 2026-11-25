export type StairLayout = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';
export type WoodFinish = 'light-oak' | 'natural-oak' | 'walnut' | 'dark-walnut';
export type MetalFinish = 'matte-black' | 'anthracite' | 'brushed-steel';
export type StairStyle = 'floating' | 'mono-stringer' | 'double-stringer' | 'zigzag' | 'central-spine' | 'side-stringer';
export type EntryDirection = 'left' | 'right' | 'not-applicable';

export type StaircaseConfiguration = {
  layout: StairLayout;
  style: StairStyle;
  wood: WoodFinish;
  metal: MetalFinish;
  stepCount: number;
  entryDirection: EntryDirection;
  /** Customer dimensions in millimetres. These are not inferred from photos. */
  widthMm?: number;
  totalRunMm?: number;
  totalRiseMm?: number;
  treadDepthMm?: number;
  treadThicknessMm?: number;
};

export type StaircaseImage = {
  id: string;
  title: string;
  imageUrl: string;
  sourceUrl: string;
  layout: StairLayout;
  /** Style/finish attributes are descriptive metadata for matching. */
  style: StairStyle;
  wood: WoodFinish;
  metal: MetalFinish;
  stepCount: number;
  entryDirection: EntryDirection;
  openRiser: true;
  glassRailing: true;
  /** Optional source metadata, not authoritative engineering dimensions. */
  widthRangeMm?: [number, number];
  treadDepthRangeMm?: [number, number];
  treadThicknessRangeMm?: [number, number];
};

export type StaircaseImageMatch = {
  image: StaircaseImage;
  score: number;
  exact: boolean;
};

/**
 * Remote image URLs are rendered by the browser, not downloaded or bundled.
 * Only add records after visually verifying open risers AND a glass railing.
 * Keep source page URL for attribution/provenance.
 */
export const REMOTE_STAIRCASE_IMAGES: StaircaseImage[] = [
  {
    id: 'spiral-uk-barrage-road-001',
    title: 'Barrage Road spiral — oak treads and glass balustrade',
    imageUrl: 'https://www.spiral.uk.com/wp-content/uploads/bis-images/1216/barrage-road-spiral-stairs-007-portrait-250x375-f50_50.jpg',
    sourceUrl: 'https://www.spiral.uk.com/case-studies/interior-steel-spiral-staircase-with-oak-treads-and-glass-balustrade/',
    layout: 'spiral',
    style: 'mono-stringer',
    wood: 'natural-oak',
    metal: 'anthracite',
    stepCount: 12,
    entryDirection: 'not-applicable',
    openRiser: true,
    glassRailing: true,
  },
];

const imageModules = import.meta.glob('/src/assets/stairs/**/*.{avif,gif,jpeg,jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const layouts = new Set<StairLayout>(['straight', 'l-shaped', 'u-shaped', 'spiral']);
const woods = new Set<WoodFinish>(['light-oak', 'natural-oak', 'walnut', 'dark-walnut']);
const metals = new Set<MetalFinish>(['matte-black', 'anthracite', 'brushed-steel']);
const styles = new Set<StairStyle>(['floating', 'mono-stringer', 'double-stringer', 'zigzag', 'central-spine', 'side-stringer']);

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

/** Local convention: <layout>/<wood>/<metal>/<style>/<entry>/<step-count>/<image> */
export function parseStaircaseImagePath(path: string, imageUrl: string): StaircaseImage | null {
  const marker = '/stairs/';
  const markerIndex = path.lastIndexOf(marker);
  if (markerIndex < 0) return null;
  const parts = path.slice(markerIndex + marker.length).split('/');
  if (parts.length !== 7) return null;

  const [layout, wood, metal, style, entryDirection, stepFolder, filename] = parts;
  const stepCount = /^(\d+)(?:-steps?)?$/.exec(stepFolder ?? '');
  if (
    !layouts.has(layout as StairLayout) ||
    !woods.has(wood as WoodFinish) ||
    !metals.has(metal as MetalFinish) ||
    !styles.has(style as StairStyle) ||
    !['left', 'right', 'not-applicable'].includes(entryDirection ?? '') ||
    !stepCount ||
    !filename
  ) return null;

  return {
    id: parts.join('/'),
    title: titleFromFilename(filename),
    imageUrl,
    sourceUrl: '',
    layout: layout as StairLayout,
    wood: wood as WoodFinish,
    metal: metal as MetalFinish,
    style: style as StairStyle,
    entryDirection: entryDirection as EntryDirection,
    stepCount: Number(stepCount[1]),
    openRiser: true,
    glassRailing: true,
  };
}

const localStaircaseImages = Object.entries(imageModules)
  .map(([path, imageUrl]) => parseStaircaseImagePath(path, imageUrl))
  .filter((image): image is StaircaseImage => image !== null);

export const STAIRCASE_IMAGE_CATALOG: StaircaseImage[] = [
  ...REMOTE_STAIRCASE_IMAGES,
  ...localStaircaseImages,
];

export function scoreStaircaseImage(image: StaircaseImage, config: StaircaseConfiguration) {
  if (image.layout !== config.layout || !image.openRiser || !image.glassRailing) return -1;

  let score = 0;
  if (image.style === config.style) score += 30;
  if (image.wood === config.wood) score += 25;
  if (image.metal === config.metal) score += 15;
  if (image.entryDirection === config.entryDirection || image.entryDirection === 'not-applicable') score += 10;
  score += Math.max(0, 20 - Math.abs(image.stepCount - config.stepCount) * 2);

  // Dimensions are optional descriptive metadata only. Never infer dimensions
  // from a photograph or let missing photo dimensions exclude a candidate.
  if (config.widthMm && image.widthRangeMm) {
    const [min, max] = image.widthRangeMm;
    score += config.widthMm >= min && config.widthMm <= max ? 5 : 0;
  }
  if (config.treadDepthMm && image.treadDepthRangeMm) {
    const [min, max] = image.treadDepthRangeMm;
    score += config.treadDepthMm >= min && config.treadDepthMm <= max ? 5 : 0;
  }
  return score;
}

export function selectStaircaseImage(
  config: StaircaseConfiguration,
  catalog: readonly StaircaseImage[] = STAIRCASE_IMAGE_CATALOG,
  random: () => number = Math.random,
): StaircaseImageMatch | null {
  const ranked = catalog
    .filter(image => image.openRiser && image.glassRailing)
    .map(image => ({ image, score: scoreStaircaseImage(image, config) }))
    .filter(candidate => candidate.score >= 0);

  if (ranked.length === 0) return null;
  const bestScore = Math.max(...ranked.map(candidate => candidate.score));
  const bestCandidates = ranked.filter(candidate => candidate.score === bestScore);
  const randomValue = Math.min(0.999999999, Math.max(0, random()));
  const selected = bestCandidates[Math.floor(randomValue * bestCandidates.length)]!;

  return {
    ...selected,
    exact: selected.image.style === config.style
      && selected.image.wood === config.wood
      && selected.image.metal === config.metal
      && selected.image.stepCount === config.stepCount
      && (selected.image.entryDirection === config.entryDirection || selected.image.entryDirection === 'not-applicable'),
  };
}
