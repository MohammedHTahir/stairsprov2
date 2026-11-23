# Sahaab Stair Studio — repository guidance

## Product definition
This application is a configuration-driven staircase image selector. Customers choose a staircase layout, timber colour, side glass configuration, steel finish, support style and step count. The app selects an existing image from the local curated image library using folder metadata and a weighted matching score.

## Product constraints
- Do not add AI models, AI Gateway, image generation, image editing, AI-generated 3D, provider API keys, external image search, or room-photo generation workflows.
- Do not fetch reference images from third-party image services. Staircase reference images are supplied and maintained in `src/assets/stairs`.
- Keep matching local and deterministic apart from random selection among equally ranked candidates.
- A selected layout is a hard constraint: never return an image for a different layout.
- When an exact finish or step-count combination is unavailable, select the closest available candidate within the requested layout.
- Keep the selected reference image separate from engineering dimensions, structural calculations and quotation values.
- Supported layouts are straight, L-shaped, U-shaped, spiral and cantilevered/floating.

## Image library
- Main workflow: `src/components/StaircaseMatcher.tsx`.
- Catalog and selection algorithm: `src/lib/staircase-image-catalog.ts`.
- Tests: `src/lib/staircase-image-catalog.test.ts`.
- Assets use the documented folder convention in `README.md`, rooted at `src/assets/stairs`.
- Vite discovers image files at build time; restart the development server after adding new assets.

## Development
- Stack: TanStack Start, React, TypeScript and Vite.
- The app does not require AI provider configuration or an external image-search service.
