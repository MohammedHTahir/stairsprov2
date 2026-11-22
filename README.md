# Sahaab Stair Studio

A rule-based staircase reference matcher built with TanStack Start, React and TypeScript.

## Product workflow

1. Choose the staircase layout.
2. Choose timber colour, steel finish and support style.
3. Select **Find my staircase**.
4. Sahaab searches its staircase reference collection and ranks real photographs using the selected configuration and image metadata.
5. The closest matching photograph is displayed with its original source and license attribution.

## Supported staircase style

Sahaab focuses on premium contemporary staircases with thick open timber treads, structural steel supports and clear glass balustrades. Supported layouts are straight, L-shaped, U-shaped and cantilevered/floating.

## No AI services

There is no AI Gateway, image-generation provider, image editing, AI model, AI credential, or AI-generated 3D feature. Matching is a deterministic metadata-scoring process over existing photographs. The result is an existing reference image, not a generated or modified image.

Reference photographs are sourced from Wikimedia Commons. Each result links to its original file page and displays attribution and license information.

## Development

Requires Node.js.

```sh
git clone https://github.com/MohammedHTahir/stairsprov2.git
cd stairsprov2
npm install
npm run dev
```

The app does not require AI provider keys or a room-image upload.
