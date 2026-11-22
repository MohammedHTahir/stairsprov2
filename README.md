# Sahaab Stair Studio

A curated staircase inspiration gallery built with TanStack Start, React and TypeScript.

## Staircase gallery

The home page opens directly into a browsable image library. Images are sourced from Wikimedia Commons and grouped by staircase configuration:

- Straight
- L-shaped
- U-shaped
- Spiral
- Floating
- Cantilevered

The gallery also filters by material: wood/timber, glass, steel/metal and stone/marble. Each category requests a larger batch of relevant photographs and supports progressive loading, keyword search, image details, source attribution and license information.

Selecting a photograph saves it as the current design reference in the browser. No image generation, AI model, AI Gateway, Cloudflare account, API token or paid image service is used by the gallery.

Images remain hosted by Wikimedia Commons. Their licenses vary, so users should open the original file page and review its license before reusing an image outside the gallery.

## Development

Requires Node.js and npm.

```sh
git clone https://github.com/MohammedHTahir/stairsprov2.git
cd stairsprov2
npm install
npm run dev
```

## Environment variables

The public inspiration gallery does not require any provider API keys. Wikimedia Commons is queried through the server route `/api/inspiration`; responses are cached at the edge.
