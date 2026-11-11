<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Legacy 3D projects persist in browser localStorage; the photo visualization workspace stores private projects, profiles, and image history in Cloud with owner-only RLS so visualization projects work across devices without destroying legacy data.
- Photoreal blend composites photo + WebGL canvas client-side, then streams an image edit via the /api/blend server route — the API key must stay server-side.
- Imported Blender/CAD model files live in IndexedDB (src/lib/imports.ts), metadata in localStorage — files are too large for localStorage.
- Whole-room scans use a separate client-only viewer and IndexedDB store with atomic file/metadata writes; preserve exported GLB geometry and scale instead of using parametric staircase fitting.
- The primary photo workspace lives in focused components and sends ordered original-room, product-reference, and optional previous-result images to an authenticated streaming server route; normalized placement and masks guide edits without modifying source photos.
- Only the root subscribes to identity transitions for auth cache invalidation; the password recovery page separately listens for recovery events to authorize its form.
- Walk-through 3D rooms come from World Labs Marble via the authenticated /api/world route (key stays server-side, client polls the operation) and render as Gaussian splats with Spark; single-photo depth/mesh tricks were rejected because they smear edges.
- Built 3D rooms are saved as a nullable world JSON on visualization_images (splat URL, scale, ground) so walkthroughs reopen without re-spending credits; the multi-floor stair shaft is a standalone client-only /building route driven by pure layout math in src/lib/building.ts.
- The app has no sign-in: /api/visualize and /api/world are open to anyone (keys stay server-side), and cloud saving/profiles are hidden because they need accounts.
