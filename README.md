# Sahaab Stair Studio

A configuration-driven staircase design finder built with TanStack Start, React and TypeScript. The app selects existing staircase images from a local, curated asset library. It does not generate or edit images.

## Customer workflow

1. Choose the staircase layout: straight, L-shaped, U-shaped, spiral or cantilevered.
2. Choose the timber colour, side glass panels, steel finish, support style and number of steps.
3. Select **Find my staircase**.
4. Sahaab searches the local image catalog, scores candidates against the configuration and randomly selects one of the best matches.
5. Select **Show another design** to see another equally suitable image.

The selector never substitutes a different staircase layout. If the exact combination is unavailable, it finds the closest available finish and step-count match within the selected layout.

## Add your staircase images

Add image files under `src/assets/stairs`. The folder names are the image metadata, so no database entry or code change is needed when adding another image.

Use this exact folder structure:

```text
src/assets/stairs/
  <layout>/
    <wood-colour>/
      <glass-option>/
        <steel-finish>/
          <support-style>/
            <number-of-steps>-steps/
              your-image.webp
```

Supported folder names:

| Attribute | Folder names |
|---|---|
| Layout | `straight`, `l-shaped`, `u-shaped`, `spiral`, `cantilevered` |
| Wood colour | `light-oak`, `natural-oak`, `walnut`, `dark-walnut` |
| Side glass | `with-glass`, `without-glass` |
| Steel finish | `matte-black`, `anthracite`, `brushed-steel` |
| Support style | `central-spine`, `side-stringer`, `cantilevered` |
| Step count | A folder such as `15-steps` (also accepts `15`) |

Example:

```text
src/assets/stairs/spiral/walnut/with-glass/matte-black/central-spine/15-steps/spiral-walnut-01.webp
src/assets/stairs/straight/natural-oak/without-glass/anthracite/side-stringer/14-steps/straight-oak-02.jpg
```

You can put multiple images in the same final folder. The app will randomly choose between equally suitable images. Supported formats are AVIF, GIF, JPEG, PNG and WebP. Prefer WebP or AVIF for smaller production bundles.

**Important:** Add files inside `src/assets/stairs`, not `public`. Vite discovers and bundles these assets at build time. Restart the dev server after adding new folders or images so the catalog is refreshed.

## How matching works

- The selected layout is a hard requirement; a spiral request can never return a straight staircase.
- Wood colour match: 30 points.
- Side glass match: 25 points.
- Steel finish match: 20 points.
- Support style match: 15 points.
- Step count: up to 10 points, decreasing for each step of difference.
- The engine randomly selects among candidates tied for the highest score.
- If no image exists for a layout, the UI explains which folder needs images.

The selected reference image never changes the customer's actual dimensions, structural configuration or quotation calculations. It is a visual reference only.

## No external image or AI services

The image catalog is bundled with the application. Matching and random selection run locally in the browser. No Wikimedia search, image-generation provider, AI model, external image API or provider API key is required.

## Development

Requires Node.js.

```sh
git clone https://github.com/MohammedHTahir/stairsprov2.git
cd stairsprov2
npm install
npm run dev
```
