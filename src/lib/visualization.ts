import { z } from 'zod';
export const pointSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });
export const visualizationSchema = z.object({
  start: pointSchema.nullable().default(null), landing: pointSchema.nullable().default(null),
  region: z.array(pointSchema).max(200).default([]),
  direction: z.string().max(300).default('Along the wall toward the existing upper landing'),
  finish: z.enum(['reference', 'oak-black', 'walnut-black', 'oak-glass']).default('reference'),
  layout: z.enum(['reference', 'straight', 'l-shaped', 'u-shaped', 'cantilevered']).default('reference'),
  refinement: z.string().max(2000).default(''),
  referenceKind: z.enum(['complete', 'support', 'side', 'spiral']).default('complete'),
  treadColor: z.enum(['reference', 'light-oak', 'natural-oak', 'walnut', 'dark-walnut', 'black-oak', 'white-oak']).default('reference'),
  metalColor: z.enum(['reference', 'matte-black', 'anthracite', 'bronze', 'white', 'brushed-steel']).default('reference'),
  wallStyle: z.enum(['keep', 'stone', 'concrete', 'white-plaster', 'wood-slats', 'marble']).default('keep'),
  floorStyle: z.enum(['keep', 'light-oak', 'dark-oak', 'herringbone', 'marble', 'concrete', 'terrazzo']).default('keep'),
  lighting: z.enum(['keep', 'wall-spots', 'step-lights', 'under-tread', 'both']).default('keep'),
});
export const treadColors: Record<VisualizationSettings['treadColor'], string> = { reference: 'Match reference', 'light-oak': 'Light oak', 'natural-oak': 'Natural oak', walnut: 'Walnut', 'dark-walnut': 'Dark walnut', 'black-oak': 'Black-stained oak', 'white-oak': 'Whitewashed oak' };
export const metalColors: Record<VisualizationSettings['metalColor'], string> = { reference: 'Match reference', 'matte-black': 'Matte black', anthracite: 'Anthracite grey', bronze: 'Bronze', white: 'White', 'brushed-steel': 'Brushed stainless steel' };
export const wallStyles: Record<VisualizationSettings['wallStyle'], string> = { keep: 'Keep original wall', stone: 'Natural stone cladding', concrete: 'Polished concrete', 'white-plaster': 'Smooth white plaster', 'wood-slats': 'Vertical wood slats', marble: 'Light marble slabs' };
export const floorStyles: Record<VisualizationSettings['floorStyle'], string> = { keep: 'Keep original floor', 'light-oak': 'Light oak planks', 'dark-oak': 'Dark smoked oak planks', herringbone: 'Oak herringbone parquet', marble: 'Large light marble tiles', concrete: 'Polished concrete', terrazzo: 'Light terrazzo' };
export const lightingStyles: Record<VisualizationSettings['lighting'], string> = { keep: 'Keep original lighting', 'wall-spots': 'Wall spotlights along the stair', 'step-lights': 'Recessed step lights', 'under-tread': 'LED line under each tread', both: 'Wall spotlights + step lights' };
const LAYOUTS: Record<string, string> = {
  reference: 'Layout: follow the stair shape of the reference.',
  straight: 'LAYOUT OVERRIDE (mandatory, overrides the reference shape): a single STRAIGHT flight in one direction from floor to landing, no turns.',
  'l-shaped': 'LAYOUT OVERRIDE (mandatory, overrides the reference shape): an L-SHAPED staircase — a first flight rises along one wall, reaches a square intermediate landing in the corner, then turns 90 degrees and a second flight continues perpendicular to the first up to the upper level. The 90-degree turn and both flights must be clearly visible. Do NOT make a straight stair.',
  'u-shaped': 'LAYOUT OVERRIDE (mandatory, overrides the reference shape): a U-SHAPED (switchback) staircase — a first flight rises to a full-width intermediate half landing, then turns 180 degrees and a second flight runs back parallel to the first, in the opposite direction, up to the upper level. Both parallel flights and the half landing must be clearly visible. Do NOT make a straight stair.',
  cantilevered: 'LAYOUT OVERRIDE (mandatory): a straight cantilevered staircase — each tread is anchored directly into the wall with no visible stringer beneath; the first tread still sits on a solid floor base.',
};
export type VisualizationSettings = z.infer<typeof visualizationSchema>;
export const defaultSettings: VisualizationSettings = visualizationSchema.parse({});
export function pointPercent(point: { x: number; y: number }) { return `${Math.round(point.x * 100)}% from left, ${Math.round(point.y * 100)}% from top`; }
export function buildVisualizationPrompt(settings: VisualizationSettings, refining: boolean) {
  return [
    `Create a photorealistic architectural staircase concept visualization. Image 1 is the original room: preserve its exact camera framing, ${settings.wallStyle === 'keep' ? 'stone wall, other walls,' : 'walls (except the stair wall change below),'} windows, doors, floor, lighting fixtures, upper-level openings and architecture. Do not redesign, remove or invent room features. Only add or edit the staircase and physically appropriate contact shadows and reflections.`,
    settings.referenceKind === 'spiral' ? 'SPIRAL STAIRCASE (mandatory, overrides any layout): a helical spiral staircase winding around one thick round black steel central column from floor to the upper level. The outer edge is a continuous curved solid black steel side panel (helical stringer plate) that follows the spiral; wedge-shaped wood treads span between the column and that curved panel with open gaps between treads. Railing: thin horizontal black metal rods following the curve, with slim black posts and a curved brushed-steel round handrail. No glass balustrade on the spiral. The curved steel panel rests directly on the floor with a contact shadow.' : 'MANDATORY in every result: a continuous frameless clear glass balustrade runs along the full open side of the staircase from the first tread to the landing. Fix the glass with a concealed base channel or small spigots at the tread edge — no metal posts, no vertical uprights, no frames along the glass.',
    'Image 2 is the staircase PRODUCT reference, not a room template. Reproduce its recognizable tread profile, support structure, color, materials and railing details faithfully. If it shows bare brackets/stringer, use that exact support system beneath suitable treads. Do not copy its background, text, watermark, studio lighting or crop. Adapt stair length and perspective to the room. Mount visibly and plausibly at the floor, wall and existing landing, not floating in midair.',
    settings.referenceKind === 'support' ? 'IMPORTANT — Image 2 shows ONLY a hidden support component, NOT the staircase itself. Build the staircase like this: thick solid light-oak floating treads are the dominant visible element. Beneath them runs ONE single narrow black steel stepped mono-stringer, centered under the MIDDLE of the tread width and set back toward the rear of each tread, mostly hidden beneath the treads. The steel must NOT be as wide as the treads, must NOT form the stair outline, must NOT be a full-width folded steel stair, and must NOT have side stringers. Each tread overhangs the stringer generously on both sides so the treads appear to float. Use the zig-zag profile and bolt plates from image 2 only for that central hidden stringer. Balustrade: continuous frameless clear glass panels on the open side, fixed with a concealed base channel or small spigots at the tread edge — NO metal posts, NO vertical uprights, NO frames, NO handrail supports along the glass.' : '',
    settings.referenceKind === 'spiral' ? '' : settings.referenceKind === 'side' ? 'Image 2 shows a SIDE steel stringer support. Build the staircase with that stepped black steel plate stringer running along the side of the treads from the floor to the landing, bolted to the floor and to the landing slab. Because the side stringer carries the stair, NO solid base block is needed.' : 'MANDATORY BASE: the staircase must visibly start from a solid base on the floor — the first step is a solid block/plinth (same material as the treads or matching stone/concrete) sitting flush on the floor with a contact shadow, and the support structure is clearly anchored into that base and into the floor. The staircase must NEVER hover above the floor; there must be no gap between the lowest step and the floor.',
    settings.referenceKind === 'spiral' ? '' : LAYOUTS[settings.layout],
    settings.start ? `The first tread/floor starting point is at ${pointPercent(settings.start)} of the ORIGINAL room image.` : 'Infer the floor starting position from available space.',
    settings.landing ? `The final upper landing connection is at ${pointPercent(settings.landing)} of the ORIGINAL room image.` : 'Connect to an existing upper opening/landing, if visible; do not create a new opening.',
    `Ascending direction: ${settings.direction}.`,
    settings.finish === 'reference' ? 'Keep the reference materials and colors.' : `Only override the reference finishes with: ${settings.finish === 'walnut-black' ? 'walnut treads and black steel' : settings.finish === 'oak-glass' ? 'light oak treads and frameless clear glass balustrade' : 'light oak treads and black steel'}.`,
    settings.treadColor !== 'reference' ? `Tread (wood slab) color: ${treadColors[settings.treadColor]}. Apply it to every tread with realistic wood grain.` : '',
    settings.metalColor !== 'reference' ? `Metal support / stringer color: ${metalColors[settings.metalColor]}.` : '',
    settings.wallStyle !== 'keep' ? `Wall behind/beside the staircase: resurface ONLY that wall with ${wallStyles[settings.wallStyle]}, keeping its exact geometry, openings and perspective. Keep all other walls unchanged.` : '',
    settings.lighting === 'wall-spots' || settings.lighting === 'both' ? 'Add a row of small round black wall spotlights on the stair wall, stepping up parallel to the stair pitch, each casting a soft warm light pool on the wall.' : '',
    settings.lighting === 'step-lights' || settings.lighting === 'both' ? 'Add warm recessed LED step lights in the wall just above each tread, softly washing the treads.' : '',
    settings.lighting === 'under-tread' ? 'Add a continuous warm LED light line recessed into the underside of each wood tread, running along the front and side edges of the slab, casting a soft glow onto the tread below and the floor.' : '',
    settings.floorStyle !== 'keep' ? `Floor: replace ONLY the floor surface with ${floorStyles[settings.floorStyle]}, keeping the exact room geometry, perspective, reflections and skirting. Keep walls, windows, doors and furniture unchanged.` : '',
    settings.region.length ? `Focus staircase placement within the marked region (${settings.region.map(pointPercent).join('; ')}). The supplied transparent mask marks the editable region; preserve everything outside it.` : '',
    'Match room perspective, vanishing points, exposure, light direction, contact shadows and glass reflections. Output the complete original room composition, with no captions, arrows or markers. This is a visual concept, not dimensional or engineering certification.',
    refining ? `Image 3 is the previous generated result. Refine that staircase only, retain every other result detail, and use image 1 as the architectural preservation anchor. Requested change: ${settings.refinement}` : '',
  ].filter(Boolean).join('\n');
}
export function buildHousePrompt(settings: VisualizationSettings, refining: boolean) {
  const full = buildVisualizationPrompt(settings, false).split('\n');
  const keep = full.filter(l => l.startsWith('MANDATORY') || l.startsWith('SPIRAL') || l.startsWith('IMPORTANT') || l.startsWith('Image 2 shows a SIDE') || l.startsWith('LAYOUT') || l.startsWith('Layout:') || l.startsWith('Tread (') || l.startsWith('Metal support') || l.startsWith('Add ') || l.startsWith('Only override') || l.startsWith('Keep the reference'));
  return [
    'Create a brand-new, ultra photorealistic interior photograph of a modern luxury home with a double-height stairwell, shot like a real architectural photo on a full-frame camera (natural daylight from large black-framed windows, soft realistic shadows, true-to-life materials, slight wide-angle, no CGI look). Show the complete staircase from floor to the upper floor with its landings, the upper floor slab edge and the walls around it.',
    'Image 1 is the staircase PRODUCT reference. Reproduce its tread thickness and profile, support structure, color and materials faithfully. Do not copy its background, text, watermark or crop. Replace any references to "image 2" below with image 1.',
    ...keep.map(l => l.replace(/image 2/gi, 'image 1')),
    settings.wallStyle !== 'keep' ? `Stair wall finish: ${wallStyles[settings.wallStyle]}.` : 'Walls: clean smooth white or light grey plaster/large-format panels.',
    settings.floorStyle !== 'keep' ? `Floor: ${floorStyles[settings.floorStyle]}.` : 'Floor: light large-format porcelain or pale oak.',
    'Treads must be physically connected to the support and wall, with accurate repeating rise and going, correct perspective and real contact shadows. No people, no text, no captions.',
    refining ? `Image 2 is the previous generated result. Keep that house and camera, change only this: ${settings.refinement}` : '',
  ].filter(Boolean).join('\n');
}
