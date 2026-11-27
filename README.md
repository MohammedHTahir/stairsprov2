# Sahaab Stair Studio

Configuration-driven staircase reference finder. Images are existing external photographs displayed by URL; the app does not generate images or store remote image binaries.

## Fixed visual requirements

Every selected reference must have:
- One of exactly four layouts: `straight`, `l-shaped`, `u-shaped`, `spiral`.
- Open risers with visible gaps between individual treads.
- Glass railing/balustrade only.

These requirements are mandatory and cannot be disabled in the configurator.

## Configuration dimensions and visual options

The selector supports:
- Layout and (where applicable) left/right entry direction.
- Structural/visual style: floating/cantilevered, mono-stringer, double-stringer, zigzag/folded steel, central spine and side stringer.
- Timber slab colour: light oak, natural oak, walnut and dark walnut (extendable).
- Steel finish: matte black, anthracite and brushed steel (extendable).
- Number of steps.
- Customer dimensions in millimetres: overall width, total run, total rise, tread depth and tread thickness.

Dimensions are customer engineering inputs. They are never inferred from a reference photo. They are retained in the configuration and must continue to drive CAD/quotation calculations in the main product workflow.

## Remote image catalog

Remote image URLs load directly from the browser and do not consume Git repository or Supabase storage. Add a record to `REMOTE_STAIRCASE_IMAGES` in `src/lib/staircase-image-catalog.ts`:

```ts
{
  id: 'unique-id',
  title: 'Short descriptive title',
  imageUrl: 'https://host.example/image.jpg',
  sourceUrl: 'https://host.example/original-project-page',
  layout: 'straight',
  style: 'mono-stringer',
  wood: 'walnut',
  metal: 'matte-black',
  stepCount: 15,
  entryDirection: 'not-applicable',
  openRiser: true,
  glassRailing: true,
}
```

Only add a record after checking the actual image for both open risers and glass railing. Keep the source page URL. Confirm the host permits remote embedding; a free-download license alone does not guarantee hotlinking permission.

## Matching behaviour

- Layout is a hard constraint: never show a different layout.
- Open risers and glass railing are hard constraints.
- Style, timber colour, steel finish, entry direction and step count contribute to match scoring.
- Dimensions are preserved as configuration inputs; if image metadata has documented dimension ranges, they can contribute to ranking. Missing photo dimensions never disqualify a candidate.
- Random variation occurs between equally ranked candidates.
- The image is a visual reference only and must never overwrite dimensions, engineering parameters, CAD geometry or quotation values.

## Local image assets (optional)

Local images can be added at `src/assets/stairs/<layout>/<wood>/<metal>/<style>/<entry>/<step-count>/<image>`. They must meet the same open-riser and glass railing requirements. Restart Vite after adding assets.

## Development

```sh
npm install
npm run dev
```
