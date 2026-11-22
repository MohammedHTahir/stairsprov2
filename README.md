# Sahaab Stair Studio

A staircase photo-visualization studio built with TanStack Start, React and TypeScript.

## Product workflow

- Upload or capture a photo of the customer's room.
- Choose the staircase layout, timber tone, metal finish, wall, floor and lighting.
- When Generate is pressed, the server searches for a close staircase reference matching the chosen layout and the supported material aesthetic.
- The selected reference is used internally as an input to image editing. Customers do not browse or see an inspiration gallery.
- Generated visualizations can be refined, downloaded and saved to a private customer project.

## Supported staircase aesthetic

Sahaab focuses on premium contemporary timber-and-steel staircases: thick open timber treads, dark structural steel supports or central spine, and clear frameless glass balustrades. Unrelated staircase families and materials are intentionally excluded from automatic reference searches.

Reference photographs are sourced from Wikimedia Commons. Attribution and license details are retained by the server; check the original file page before reusing an image outside the product.

## Development

Requires Node.js.

```sh
git clone https://github.com/MohammedHTahir/stairsprov2.git
cd stairsprov2
npm install
npm run dev
```

## Environment variables

- Supabase URL and publishable key for authentication and private project storage.
- AI_GATEWAY_API_KEY for image editing through the configured image provider.
- WORLDLABS_API_KEY only if the optional 3D room workflow is enabled.

No public inspiration gallery is displayed in the customer workflow.
