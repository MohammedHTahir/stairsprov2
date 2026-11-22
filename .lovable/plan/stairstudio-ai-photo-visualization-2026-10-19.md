# Sahaab Stair Studio — staircase reference matching

## Product definition
Sahaab is a rule-based staircase reference matching application. It does not generate or edit images.

## Customer workflow
1. Select the staircase layout: straight, L-shaped, U-shaped or cantilevered/floating.
2. Select timber tread colour, steel finish and support style.
3. Submit the configuration.
4. Search the existing reference-photo collection and score candidates using title and description metadata.
5. Display only the closest matching existing photograph with source and license attribution.

## Design constraints
- Premium contemporary staircase aesthetic: thick open timber treads, structural steel and clear frameless glass balustrades.
- No visible browsable gallery.
- No AI Gateway, image-generation service, image editing, AI credentials, room photo upload, or AI-generated 3D.
- The result is a real reference photograph. It is not an architectural visualization or engineering drawing.

## Implementation
- Frontend: src/components/StaircaseMatcher.tsx
- Matching API: src/routes/api/inspiration.ts
- Matching method: deterministic metadata scoring based on the selected configuration.
