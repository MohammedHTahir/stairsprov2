# Sahaab Stair Studio — repository guidance

## Product definition
This application is a deterministic staircase reference matcher. Customers choose a staircase layout, timber tread colour, steel finish and support style. The server searches existing staircase photographs, scores their descriptive metadata against the selected configuration, and displays the closest existing photograph with source and license attribution.

## Product constraints
- Do not add AI models, AI Gateway, image generation, image editing, AI-generated 3D, provider API keys, or room-photo generation workflows.
- Do not create or display a browsable inspiration gallery. Show only the closest matching photograph after the customer submits a configuration.
- Matching must be transparent and deterministic: use explicit configuration fields and image metadata scoring.
- Sahaab's visual focus is premium contemporary stairs with thick open timber treads, structural steel and clear glass balustrades.
- Supported layouts are straight, L-shaped, U-shaped and cantilevered/floating.
- Preserve source attribution and license links for every selected reference photo.
- The match result is an existing photograph, not a generated or modified image.

## Development
- Stack: TanStack Start, React, TypeScript and Vite.
- Main workflow: src/components/StaircaseMatcher.tsx.
- Reference matching endpoint: src/routes/api/inspiration.ts.
- The application should not require Supabase credentials or any AI provider configuration.
