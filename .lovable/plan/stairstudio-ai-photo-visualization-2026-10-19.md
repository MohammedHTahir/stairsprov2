# StairStudio AI — photo visualization

## New direction
Replace the scanning-first and parametric staircase experience with one focused workspace: **room photo + staircase reference → photorealistic room visualization**. No Kiri signup or reconstruction service is needed.

## What to build
1. **Photo workspace** as the first screen, retaining the premium light architectural style. Upload or take a room photo, then upload a staircase reference or choose one of your five product images.
2. **Placement and finishes**: mark the stair starting point and upper landing on the room photo, describe the intended direction, and choose reference materials, oak with black steel, walnut with black steel, or oak with glass. Allow a drawn edit region to focus changes.
3. **Real image generation** using both source images. Prioritize the reference's tread profile, support structure, railing, and materials while preserving existing architecture and matching perspective, lighting, reflections, and contact shadows.
4. **Results and refinement**: streamed previews, before/after slider, original/result views, image download, and follow-up requests such as moving the stairs or changing the treads. Each variation is an explicit user action.
5. **Saved projects and history** with Lovable Cloud, including private uploaded photos and generated images, and account sign-in for saving across devices.
6. **Your images**: use the first two as a clearly labeled example comparison, never as a claimed live generation. Use the remaining images in the product library; distinguish bare support components from complete stairs.

## Scope and limitations
- Remove scanning and 3D controls from the primary navigation; retain existing pages and data so old projects are not destroyed.
- No payments, subscriptions, invented pricing, or accuracy guarantees in this MVP.
- Exact product fidelity and unchanged architecture are generation goals, not promises. Results remain concept visualizations, not construction drawings.
- Validate a real room/product generation and a refinement, then check upload, comparison, download, and saved-history flows on phone and desktop.

## Technical approach
- Keep the existing TanStack Start framework and design components; do not switch to Next.js.
- Reuse the current image-editing provider and streaming parser, adding validated multi-image requests and placement guidance on the server. Keep all keys and generation instructions server-side.
- Use private Cloud storage and owner-only project/history access. Existing offline 3D projects remain separate.
- Add focused tests for placement coordinates, preservation/refinement request handling, and project ownership rules.
- Account profile details will be confirmed before adding account code; the MVP does not need a separate public profile.