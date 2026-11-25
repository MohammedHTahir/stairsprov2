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
  stepCount?: number;
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
    id: "straight-stairbox-oak-glass-01",
    title: "Straight oak open-riser staircase with glass balustrade",
    imageUrl: "https://cdn.stairbox.com/assets/wp-content/uploads/2021/05/50849932_1995714070482920_1023185012339507200_n-crop-1024x1024.jpg",
    sourceUrl: "https://www.stairbox.com/blog/5-ways-to-open-up-your-space-with-a-clever-staircase-design",
    layout: "straight",
    style: "double-stringer",
    wood: "natural-oak",
    metal: "anthracite",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-houzz-oak-glass-02",
    title: "Straight floating oak staircase with glass panels",
    imageUrl: "https://st.hzcdn.com/simgs/9f8127b705b27d53_9-6310/home-design.jpg",
    sourceUrl: "https://www.houzz.co.uk/photos/molesey-park-road-contemporary-staircase-surrey-phvw-vp~202953857",
    layout: "straight",
    style: "floating",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-williamarchi-steel-oak-03",
    title: "Straight double-stringer oak staircase with glass railing",
    imageUrl: "https://www.williamarchi.com/Uploads/6320a4c90fc1f.jpg",
    sourceUrl: "https://www.williamarchi.com/product/wood-treads-straight-stairs.html",
    layout: "straight",
    style: "double-stringer",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "l-ovoms-floating-oak-01",
    title: "L-shaped floating oak staircase with clear glass",
    imageUrl: "https://www.ovoms.com/web/image/40790-43113c99/2.webp",
    sourceUrl: "https://www.ovoms.com/projects/l-shaped-floating-staircase",
    layout: "l-shaped",
    style: "floating",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "l-keuka-glass-oak-02",
    title: "L-shaped floating staircase with glass railing",
    imageUrl: "https://www.keuka-studios.com/wp-content/uploads/2019/09/L-shaped-stairs-with-Glass-Railing-1024x683.jpg",
    sourceUrl: "https://www.keuka-studios.com/how-much-do-custom-floating-stairs-cost/",
    layout: "l-shaped",
    style: "floating",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "l-alibaba-open-riser-03",
    title: "L-shaped open-riser wood staircase with glass guarding",
    imageUrl: "https://s.alicdn.com/@sc04/kf/H1754b7cafa8f4bc3aa981140ba51dede4/Open-Riser-Staircase-Design-L-Shaped-Straight-Mono-Stringer-Stairs-for-Indoor-Apartment.jpg",
    sourceUrl: "https://www.alibaba.com/showroom/l-shaped-deck-stairs.html",
    layout: "l-shaped",
    style: "mono-stringer",
    wood: "light-oak",
    metal: "matte-black",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-china-prt69-dark-oak-01",
    title: "U-shaped dark wood staircase with glass balustrade",
    imageUrl: "https://www.chinastaircase.com/Uploads/6030c1b06a691.jpg",
    sourceUrl: "https://www.chinastaircase.com/product/prefab-used-u-shaped-staircase-indoor-solid-wood-staircase-for-sale.html",
    layout: "u-shaped",
    style: "double-stringer",
    wood: "dark-walnut",
    metal: "matte-black",
    entryDirection: "left",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-alibaba-oak-mono-02",
    title: "U-shaped floating oak staircase with glass panels",
    imageUrl: "https://s.alicdn.com/@sc04/kf/A3095d578968147ffb7c910c290b75b1eU/Realgres-Modern-Indoor-Mono-Stringer-Staircase-Oak-3-x-4-x11-Wooden-Duplex-U-Shaped-Stairs.jpg",
    sourceUrl: "https://www.alibaba.com/showroom/u-shaped-wood-stairs.html",
    layout: "u-shaped",
    style: "mono-stringer",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "left",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-eventscape-sapele-03",
    title: "U-shaped residential staircase with Sapele timber and glass",
    imageUrl: "https://eventscape.com/wp-content/uploads/2017/07/elsner_murray_staircase-5.jpg",
    sourceUrl: "https://eventscape.com/portfolio/private-residence/",
    layout: "u-shaped",
    style: "central-spine",
    wood: "walnut",
    metal: "matte-black",
    entryDirection: "left",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "spiral-barrage-oak-glass-01",
    title: "Barrage Road spiral — oak treads and glass balustrade",
    imageUrl: "https://www.spiral.uk.com/wp-content/uploads/bis-images/1216/barrage-road-spiral-stairs-007-portrait-250x375-f50_50.jpg",
    sourceUrl: "https://www.spiral.uk.com/case-studies/interior-steel-spiral-staircase-with-oak-treads-and-glass-balustrade/",
    layout: "spiral",
    style: "mono-stringer",
    wood: "natural-oak",
    metal: "anthracite",
    stepCount: 12,
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "spiral-christchurch-pine-glass-02",
    title: "Christ Church spiral — pine treads and glass balustrade",
    imageUrl: "https://www.spiral.uk.com/wp-content/uploads/bis-images/1832/Christchurch-7361-2000-x-3000-4-scaled-250x375-f50_50.jpg",
    sourceUrl: "https://www.spiral.uk.com/case-studies/christ-church-ware/",
    layout: "spiral",
    style: "mono-stringer",
    wood: "light-oak",
    metal: "anthracite",
    stepCount: 13,
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "spiral-monksfarm-oak-glass-03",
    title: "Monks Farm helical — oak treads and curved glass",
    imageUrl: "https://www.spiral.uk.com/wp-content/uploads/bis-images/2426/Monks-Farm-JOB-9791-Thumbnail-Image-1-scaled-250x375-f50_50.jpg",
    sourceUrl: "https://www.spiral.uk.com/case-studies/double-steel-helical-curved-staircase-in-oxford-by-spiral-uk/",
    layout: "spiral",
    style: "floating",
    wood: "natural-oak",
    metal: "anthracite",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "spiral-dna-oak-glass-04",
    title: "DNA helical spiral — oak treads and clear glass railing",
    imageUrl: "https://www.chinastaircase.com/Uploads/603c8c317ef21.jpg",
    sourceUrl: "https://www.chinastaircase.com/product/dna-helical-glass-spiral-Staircase-with-glass-railng.html",
    layout: "spiral",
    style: "mono-stringer",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "spiral-houzz-oak-glass-05",
    title: "Scandinavian oak spiral with curved glass balustrade",
    imageUrl: "https://st.hzcdn.com/fimgs/pictures/staircases/glass-railing-staircases-arcways-inc-img~5be19c0906de24f5_8903-1-d8c78b1-w720-h720-b2-p0.jpg",
    sourceUrl: "https://www.houzz.co.uk/photos/scandinavian-staircase-ideas-and-designs-phbr1-bp~t_10413~s_22921",
    layout: "spiral",
    style: "floating",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  }
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
  if (image.stepCount !== undefined) score += Math.max(0, 20 - Math.abs(image.stepCount - config.stepCount) * 2);

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
