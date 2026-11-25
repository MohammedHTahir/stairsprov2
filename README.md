# Sahaab Stair Studio

A configuration-driven staircase design finder built with TanStack Start, React and TypeScript. The app displays curated existing staircase images from remote image URLs and optional local assets. It does not generate or edit images.

## Fixed design requirements

Every image in the selection catalog must satisfy BOTH requirements:
- **Open risers:** visible gaps between each tread; no closed risers or solid infill between steps.
- **Glass railing:** a glass balustrade/guardrail must be visible.

Supported layouts are exactly:
- `straight`
- `l-shaped`
- `u-shaped`
- `spiral`

There is no option to disable the glass railing or select closed risers. Do not add other staircase layouts.

## Remote image library (recommended)

Remote image URLs are rendered directly in the browser. The app does not download, copy, bundle, or proxy the image files, so they do not increase the Git repository size.

Add records to `REMOTE_STAIRCASE_IMAGES` in `src/lib/staircase-image-catalog.ts`:

```ts
{
  id: 'unique-image-id',
  title: 'Short descriptive title',
  imageUrl: 'https://image-host.example/path/to/image.jpg',
  sourceUrl: 'https://original-photo-page.example/',
  layout: 'straight',
  wood: 'natural-oak',
  metal: 'matte-black',
  stepCount: 15,
  openRiser: true,
  glassRailing: true,
}
```

Only add an image after checking the actual photograph for open gaps between the treads and a glass railing. The `openRiser` and `glassRailing` flags are an editorial verification record, not automatic computer vision. Keep the original source page URL for attribution and provenance. Prefer providers whose terms permit embedding/hotlinking; a free-download license does not automatically guarantee every form of remote embedding is allowed.

### Remote image trade-offs

- No image storage in Git or Supabase.
- Browser visitors load images from the third-party host, using their bandwidth.
- The original host can change URLs, block hotlinking, resize images, or remove them.
- The app needs an internet connection to display remote images.
- For production reliability, use a licensed image CDN or storage bucket if a source prohibits hotlinking.

## Optional local images

Local images can still be added under:

```text
src/assets/stairs/<layout>/<wood>/<metal>/<step-count>/<image>
```

Use the same four layout names, supported wood and metal values, and numeric step folders such as `15-steps`. Local images must also be open-riser with glass railing. Add only verified images and restart Vite after adding files.

## Matching

- The selected layout is a hard requirement.
- Wood finish and metal finish are scored preferences.
- Step count is scored by proximity.
- Random selection occurs among candidates with the highest score.
- No match is returned if the chosen layout has no verified images.
- The selected image never changes the customer's dimensions, engineering configuration or quotation calculations.

## Development

```sh
npm install
npm run dev
```
