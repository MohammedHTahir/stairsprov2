import { describe, it, expect } from 'vitest';
import { visualizationSchema, pointPercent, buildVisualizationPrompt } from './visualization';
describe('Placement rules', () => {
  it('keeps room positions in normalized image bounds', () => { expect(visualizationSchema.safeParse({ start: { x: 1.01, y: 0.5 } }).success).toBe(false); expect(pointPercent({ x: .3, y: .8 })).toBe('30% from left, 80% from top'); });
  it('uses the prior image and explicit change only for a refinement', () => { const s = visualizationSchema.parse({ refinement: 'move the staircase 30 cm to the right' }); expect(buildVisualizationPrompt(s, true)).toContain('Image 3 is the previous generated result'); expect(buildVisualizationPrompt(s, true)).toContain(s.refinement); expect(buildVisualizationPrompt(s, false)).not.toContain('Image 3'); });
  it('preserves architecture and product reference roles', () => { const p = buildVisualizationPrompt(visualizationSchema.parse({}), false); expect(p).toContain('Image 1 is the original room'); expect(p).toContain('Image 2 is the staircase PRODUCT reference'); expect(p).toContain('Do not redesign, remove or invent room features'); });
});
describe('Support component references', () => {
  it('places one central stringer behind treads with post-free glass', () => { const p = buildVisualizationPrompt(visualizationSchema.parse({ referenceKind: 'support' }), false); expect(p).toContain('centered under the MIDDLE'); expect(p).toContain('NO metal posts'); expect(buildVisualizationPrompt(visualizationSchema.parse({}), false)).not.toContain('centered under the MIDDLE'); });
});

import { describe as d2, it as i2, expect as e2 } from 'vitest';
import { buildVisualizationPrompt as bp, defaultSettings as ds } from './visualization';
d2('finish options', () => {
  i2('always requires the glass side panel', () => { e2(bp(ds, false)).toContain('frameless clear glass balustrade'); });
  i2('applies chosen wood, metal, wall and spotlights', () => {
    const p = bp({ ...ds, treadColor: 'walnut', metalColor: 'bronze', wallStyle: 'marble', lighting: 'wall-spots' }, false);
    e2(p).toContain('Walnut'); e2(p).toContain('Bronze'); e2(p).toContain('Light marble slabs'); e2(p).toContain('wall spotlights');
  });
  i2('replaces only the floor surface for a chosen floor style', () => { const p = bp({ ...ds, floorStyle: 'herringbone' }, false); e2(p).toContain('Oak herringbone parquet'); e2(p).toContain('replace ONLY the floor surface'); e2(bp(ds, false)).not.toContain('replace ONLY the floor'); });
  i2('adds an LED line under each tread for under-tread lighting', () => { const p = bp({ ...ds, lighting: 'under-tread' }, false); e2(p).toContain('LED light line recessed into the underside of each wood tread'); e2(bp(ds, false)).not.toContain('underside of each wood tread'); });
});

d2('base and layout', () => {
  i2('requires a floor base unless a side stringer is chosen', () => { e2(bp(ds, false)).toContain('MANDATORY BASE'); e2(bp({ ...ds, referenceKind: 'side' }, false)).not.toContain('MANDATORY BASE'); });
  i2('forces L and U shapes', () => { e2(bp({ ...ds, layout: 'l-shaped' }, false)).toContain('turns 90 degrees'); e2(bp({ ...ds, layout: 'u-shaped' }, false)).toContain('turns 180 degrees'); });
});
d2('generated house mode', () => {
  i2('needs no room photo and keeps glass, base and layout', () => { const p = (await_import()).buildHousePrompt({ ...ds, layout: 'u-shaped' }, false); e2(p).not.toContain('original room'); e2(p).toContain('frameless clear glass'); e2(p).toContain('MANDATORY BASE'); e2(p).toContain('turns 180 degrees'); });
});
import * as vmod from './visualization';
function await_import() { return vmod; }
d2('spiral', () => { i2('uses a curved metal side panel, no glass and ignores layout', () => { const p = vmod.buildHousePrompt({ ...ds, referenceKind: 'spiral', layout: 'l-shaped' }, false); e2(p).toContain('curved solid black steel side panel'); e2(p).not.toContain('frameless clear glass balustrade runs'); e2(p).not.toContain('turns 90 degrees'); }); });
