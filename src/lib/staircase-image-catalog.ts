export type StairLayout = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';
export type WoodFinish = 'light-oak' | 'natural-oak' | 'walnut' | 'dark-walnut';
export type MetalFinish = 'matte-black' | 'anthracite' | 'brushed-steel';
export type StairStyle = 'floating' | 'mono-stringer' | 'double-stringer' | 'zigzag' | 'central-spine' | 'side-stringer';
export type EntryDirection = 'left' | 'right' | 'not-applicable';

export type StaircaseConfiguration = {
  layout: StairLayout;
  /** Number of intermediate platforms; used only for straight flights. */
  landingCount?: 0 | 1 | 2;
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
  /** Number of intermediate platforms; omitted means no intermediate landing. */
  landingCount?: 0 | 1 | 2;
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
  },
  {
    id: "straight-ovoms-floating-oak-04",
    title: "Straight floating oak treads with glass balustrade",
    imageUrl: "https://www.ovoms.com/web/image/product.image/904/image_1024/IMG_3399.webp?unique=fb3491b",
    sourceUrl: "https://www.ovoms.com/shop/floating-staircase-19",
    layout: "straight",
    style: "floating",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-design-fabrications-spine-oak-05",
    title: "Straight central spine oak staircase with frameless glass",
    imageUrl: "https://cdn.shopify.com/s/files/1/0789/4135/6310/files/Fully_fabricated_central_spine_metal_staircase_with_Oak_treads.jpg?v=1752508477",
    sourceUrl: "https://designfabrications.co.uk/blogs/project-focus/central-spine-staircase-with-wrap-around-treads-and-frameless-glass-balustrade-saffron-walden-essex",
    layout: "straight",
    style: "central-spine",
    wood: "walnut",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-madeinchina-oak-glass-06",
    title: "Straight floating oak staircase with concealed beam and glass",
    imageUrl: "https://image.made-in-china.com/202f0j00hZqQOKrcYgRa/Floating-Staircase-Design-with-Oak-Wood-Tread-Hidden-Beam-Glass-Staircase.webp",
    sourceUrl: "https://es.made-in-china.com/co_acearchi/product_Dise-o-de-la-escalera-flotante-con-la-banda-de-rodadura-de-madera-de-roble-Haz-oculta-escalera-de-cristal_eughusesy.html",
    layout: "straight",
    style: "floating",
    wood: "light-oak",
    metal: "brushed-steel",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "l-etsy-central-spine-oak-glass-04",
    title: "L-shaped central spine oak staircase with glass balustrade",
    imageUrl: "https://i.etsystatic.com/51658481/r/il/ba2acc/6764371646/il_fullxfull.6764371646_c71s.jpg",
    sourceUrl: "https://www.etsy.com/uk/listing/1897676557/l-shaped-central-spine-staircase-design",
    layout: "l-shaped",
    style: "central-spine",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },

  {
    id: "straight-ovoms-dark-oak-glass-07",
    title: "Dark oak floating staircase with frameless glass balustrade",
    imageUrl: "https://www.ovoms.com/web/image/33898-991dfa44/DSC02155.webp",
    sourceUrl: "https://www.ovoms.com/floating-stairs-with-led-billy",
    layout: "straight",
    style: "floating",
    wood: "dark-walnut",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-houzz-tindalls-oak-glass-04",
    title: "U-shaped floating oak staircase with glass balustrade",
    imageUrl: "https://st.hzcdn.com/simgs/98b1945c020ef3a7_9-0071/home-design.jpg",
    sourceUrl: "https://www.houzz.co.uk/photos/tindalls-road-modern-staircase-auckland-phvw-vp~183919285",
    layout: "u-shaped",
    style: "mono-stringer",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-madeinchina-oak-glass-05",
    title: "U-shaped floating oak staircase with glass railing",
    imageUrl: "https://image.made-in-china.com/2f0j00yHZCbgmwwfqV/Modern-Prefabricated-U-Shaped-Indoor-Oak-Staircase-with-Glass-Railing.webp",
    sourceUrl: "https://stairshousebuilding.en.made-in-china.com/product/dAXYUtWVAshM/China-Modern-Prefabricated-U-Shaped-Indoor-Oak-Staircase-with-Glass-Railing.html",
    layout: "u-shaped",
    style: "floating",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "left",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "spiral-idei-club-dark-oak-glass-06",
    title: "Contemporary spiral staircase with timber treads and glass balustrade",
    imageUrl: "https://idei.club/raznoe/uploads/posts/2022-12/1671655125_idei-club-p-poruchen-dlya-vintovoi-lestnitsi-iz-metall-80.jpg",
    sourceUrl: "https://idei.club/raznoe/12113-poruchen-dlja-vintovoj-lestnicy-iz-metalla.html",
    layout: "spiral",
    style: "mono-stringer",
    wood: "dark-walnut",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-berman-red-oak-glass-08",
    title: "Straight red oak mono-stringer staircase with glass railing",
    imageUrl: "https://www.bermanstair.com/Uploads/pro/indoor-Straight-wood-tread-glass-railing-Modern-Floating-StaircasePrefab-led-light-wood-Stair.17.3-3.jpg",
    sourceUrl: "https://www.bermanstair.com/indoor-Straight-wood-tread-glass-railing-Modern-Floating-StaircasePrefab-led-light-wood-Stair-p.html",
    layout: "straight",
    style: "mono-stringer",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-madeinchina-nordic-oak-glass-09",
    title: "Nordic straight mono-stringer oak staircase with glass railing",
    imageUrl: "https://image.made-in-china.com/2f0j00bqzpSsEWOgur/Nordic-Style-Indoor-Single-Stringer-Straight-Staircase-Solid-Wood-Steps-with-Glass-Handrail.webp",
    sourceUrl: "https://idlbuilding.en.made-in-china.com/product/VZYfhosOZARa/China-Nordic-Style-Indoor-Single-Stringer-Straight-Staircase-Solid-Wood-Steps-with-Glass-Handrail.html",
    layout: "straight",
    style: "mono-stringer",
    wood: "light-oak",
    metal: "matte-black",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },

  {
    id: "l-madeinchina-black-steel-oak-glass-06",
    title: "L-shaped floating oak staircase with glass panels and black steel",
    imageUrl: "https://image.made-in-china.com/2f0j00QKEhODrdOpfu/Modern-L-Shaped-Staircase-Space-Saving-Design-for-Homes-and-Multi-Level-Apartments.webp",
    sourceUrl: "https://shangbu.en.made-in-china.com/product/cdqToKePnktf/China-Modern-L-Shaped-Staircase-Space-Saving-Design-for-Homes-and-Multi-Level-Apartments.html",
    layout: "l-shaped",
    style: "double-stringer",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },

  {
    id: "u-pinterest-dark-oak-glass-07",
    title: "U-shaped dark timber open-riser staircase with glass railing",
    imageUrl: "https://i.pinimg.com/originals/f7/8b/99/f78b99619f9f096d86aaa2cba1f01bbb.png",
    sourceUrl: "https://www.pinterest.com/pin/u-shaped-straight-staircase-indoor-metal-stair-railing-with-post-glass-railing--852165560724484214/",
    layout: "u-shaped",
    style: "double-stringer",
    wood: "dark-walnut",
    metal: "matte-black",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "straight-grt-mono-oak-glass-10",
    title: "Straight mono-stringer oak staircase with glass railing",
    imageUrl: "https://grtbuilding.com/wp-content/uploads/2021/06/SS-WS-GR-01.jpg",
    sourceUrl: "https://grtbuilding.com/product/mono-stringer-straight-staircase-wood-steps-glass-railing-grt-ss01/",
    layout: "straight",
    style: "mono-stringer",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "not-applicable",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "l-ovoms-floating-oak-glass-07",
    title: "L-shaped floating oak staircase with frameless glass balustrade",
    imageUrl: "https://www.ovoms.com/web/image/6263-429ee13e/DSC00296.jpg",
    sourceUrl: "https://www.ovoms.com/l-shaped-floating-staircase",
    layout: "l-shaped",
    style: "floating",
    wood: "natural-oak",
    metal: "brushed-steel",
    entryDirection: "right",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-madeinchina-open-oak-glass-08",
    title: "U-shaped open-riser oak staircase with glass railings",
    imageUrl: "https://image.made-in-china.com/2f0j00DSViUjpIYuRZ/Luxury-U-Shape-Staircase-Glass-Railing-with-Open-Riser-Design-and-Oak-Finish.webp",
    sourceUrl: "https://m.made-in-china.com/product/Luxury-U-Shape-Staircase-Glass-Railing-with-Open-Riser-Design-and-Oak-Finish-1954410061.html",
    layout: "u-shaped",
    style: "double-stringer",
    wood: "natural-oak",
    metal: "matte-black",
    entryDirection: "left",
    openRiser: true,
    glassRailing: true,
  },
  {
    id: "u-jyhouse-oak-glass-09",
    title: "U-shaped floating wood staircase with clear glass balustrade",
    imageUrl: "https://image.made-in-china.com/202f0j00fhrqHTJdCZzV/U-Shape-Steel-Wood-Stairs-Indoor-Straight-Modern-Staircase-with-Glass-Railings.webp",
    sourceUrl: "https://jyhousebuilding.en.made-in-china.com/product/VnWrkhYEuMRf/China-U-Shape-Steel-Wood-Stairs-Indoor-Straight-Modern-Staircase-with-Glass-Railings.html",
    layout: "u-shaped",
    style: "central-spine",
    wood: "light-oak",
    metal: "matte-black",
    entryDirection: "right",
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
  if (config.layout === 'straight' && (image.landingCount ?? 0) !== (config.landingCount ?? 0)) return -1;

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
  previousImageId?: string,
): StaircaseImageMatch | null {
  const ranked = catalog
    .filter(image => image.openRiser && image.glassRailing)
    .map(image => ({ image, score: scoreStaircaseImage(image, config) }))
    .filter(candidate => candidate.score >= 0);

  if (ranked.length === 0) return null;
  // Start with the strongest matches, then rotate through the remaining
  // eligible images on subsequent Generate clicks. This prevents a single
  // exact match from being returned repeatedly.
  ranked.sort((a, b) => b.score - a.score || a.image.id.localeCompare(b.image.id));
  let selected = ranked[0]!;
  if (previousImageId) {
    const previousIndex = ranked.findIndex(candidate => candidate.image.id === previousImageId);
    if (previousIndex >= 0) selected = ranked[(previousIndex + 1) % ranked.length]!;
    else {
      const randomValue = Math.min(0.999999999, Math.max(0, random()));
      selected = ranked[Math.floor(randomValue * ranked.length)]!;
    }
  } else {
    const randomValue = Math.min(0.999999999, Math.max(0, random()));
    selected = ranked[Math.floor(randomValue * ranked.length)]!;
  }

  return {
    ...selected,
    exact: selected.image.style === config.style
      && selected.image.wood === config.wood
      && selected.image.metal === config.metal
      && selected.image.stepCount === config.stepCount
      && (selected.image.entryDirection === config.entryDirection || selected.image.entryDirection === 'not-applicable'),
  };
}
