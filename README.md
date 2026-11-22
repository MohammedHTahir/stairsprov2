# Sahaab Stair Studio

A staircase design and inspiration workspace built with TanStack Start, React, TypeScript, Supabase and Three.js.

## Gallery-first experience

The home page opens directly into the staircase inspiration gallery. It searches Wikimedia Commons for real staircase photography and supports filters for:

- Staircase layout: straight, L-shaped, U-shaped, spiral and floating.
- Materials: wood/timber, glass, steel/metal and stone/marble.
- Keyword search within loaded results.
- Progressive loading, with 30 results per request.

The gallery requires no image-generation model or API key. Images are hotlinked from Wikimedia Commons, with the photographer/contributor, license and original file page shown with each result. The selected reference is saved in the browser under `sahaab:selected-staircase-reference`.

Images are inspiration references only; they are not AI-generated previews of the customer's room and are not engineering drawings. Users should review the original file page and license before reusing an image outside the reference experience.

## Development

Requires Node.js and npm.

```sh
git clone https://github.com/MohammedHTahir/stairsprov2.git
cd stairsprov2
npm install
npm run dev
```

## Environment variables

Configure the Supabase variables from `.env.example` for authentication and private project storage. Configure `WORLDLABS_API_KEY` only if the optional 3D room workflow is used.

The public inspiration gallery itself does not require a provider key. It uses the Wikimedia Commons Action API through the server route `/api/inspiration`, which caches search responses at the edge.

## Deploying to Vercel

1. Import the repository at [Vercel](https://vercel.com/new).
2. Add the Supabase environment variables from `.env.example`.
3. Add `WORLDLABS_API_KEY` if the optional 3D room workflow is enabled.
4. Deploy.
