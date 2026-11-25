export type StairLayout = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';
export type WoodFinish = 'light-oak' | 'natural-oak' | 'walnut' | 'dark-walnut';
export type MetalFinish = 'matte-black' | 'anthracite' | 'brushed-steel';

export type StaircaseConfiguration = {
  layout: StairLayout;
  wood: WoodFinish;
  metal: MetalFinish;
  stepCount: number;
};

export type StaircaseImage = StaircaseConfiguration & {
  id: string;
  title: string;
  imageUrl: string;
  sourceUrl: string;
  /** Every library entry must be checked as an open-riser staircase. */
  openRiser: true;
  /** Every library entry must have a glass balustrade/railing. */
  glassRailing: true;
};

export type StaircaseImageMatch = {
  image: StaircaseImage;
  score: number;
  exact: boolean;
};

/**
 * External image URLs are rendered directly by the browser. No image binaries
 * are downloaded, copied into the repository, or bundled into the app.
 *
 * Only add a record after checking the source image itself for BOTH open
 * risers (visible gaps between treads) and a glass railing. Keep the source
 * page URL for attribution and provenance.
 */
export const REMOTE_STAIRCASE_IMAGES: StaircaseImage[] = [
  {
    id: 'spiral-uk-barrage-road-001',
    title: 'Barrage Road spiral — oak treads and glass balustrade',
    imageUrl: 'https://www.spiral.uk.com/wp-content/uploads/bis-images/1216/barrage-road-spiral-stairs-007-portrait-250x375-f50_50.jpg',
    sourceUrl: 'https://www.spiral.uk.com/case-studies/interior-steel-spiral-staircase-with-oak-treads-and-glass-balustrade/',
    layout: 'spiral',
    wood: 'natural-oak',
    metal: 'anthracite',
    stepCount: 12,
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

function titleFromFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

/**
 * Local asset folder convention:
 * src/assets/stairs/<layout>/<wood>/<metal>/<step-count>/<image>
 * Local images are also required to be open-riser with glass railing.
 */
export function parseStaircaseImagePath(path: string, imageUrl: string): StaircaseImage | null {
  const marker = '/stairs/';
  const markerIndex = path.lastIndexOf(marker);
  if (markerIndex < 0) return null;

  const parts = path.slice(markerIndex + marker.length).split('/');
  if (parts.length !== 5) return null;

  const [layout, wood, metal, stepFolder, filename] = parts;
  const stepCount = /^(\d+)(?:-steps?)?$/.exec(stepFolder ?? '');
  if (
    !layouts.has(layout as StairLayout) ||
    !woods.has(wood as WoodFinish) ||
    !metals.has(metal as MetalFinish) ||
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
  if (image.layout !== config.layout) return -1;
  if (!image.openRiser || !image.glassRailing) return -1;

  let score = 0;
  if (image.wood === config.wood) score += 40;
  if (image.metal === config.metal) score += 30;
  score += Math.max(0, 30 - Math.abs(image.stepCount - config.stepCount) * 3);
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
    exact: selected.image.wood === config.wood
      && selected.image.metal === config.metal
      && selected.image.stepCount === config.stepCount,
  };
}
