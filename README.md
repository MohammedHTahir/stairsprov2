# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploying to Vercel

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new) (TanStack Start + Nitro is detected automatically).
2. Add environment variables (Project → Settings → Environment Variables):
   - `AI_GATEWAY_API_KEY` — from the Vercel AI Gateway dashboard (image edits use `openai/gpt-image-2.5-sunburst`)
   - `WORLDLABS_API_KEY` — for 3D rooms
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (and the non-`VITE_` equivalents in `.env.example`)
3. Deploy.

The image model is set in `src/lib/image-gateway.server.ts`. AI Gateway does not stream partial image edits, so that file emits a single SSE `completed` event to the browser.


## Free AI image generation (Cloudflare Workers AI)

Image generation uses Black Forest Labs FLUX.2 [klein] 4B through Cloudflare Workers AI. This replaces the paid Vercel AI Gateway image model. The model accepts up to four reference images for image editing; the browser prepares reference copies below 512x512 while retaining original-resolution images in the workspace and Supabase project storage.

Configure these server-side environment variables in Vercel and local development:

- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
- `CLOUDFLARE_API_TOKEN`: an API token with Workers AI Run permission. Never expose it as a `VITE_*` variable.

Cloudflare Workers AI currently includes 10,000 free neurons per day, resetting at 00:00 UTC. Once the free allowance is exhausted, generation requests are rejected until reset; no paid overage is enabled on the Workers Free plan. See [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) and [FLUX.2 Klein 4B documentation](https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/).
