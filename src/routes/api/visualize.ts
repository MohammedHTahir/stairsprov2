import { createFileRoute } from '@tanstack/react-router';
import { visualizationSchema, buildVisualizationPrompt, buildHousePrompt } from '@/lib/visualization';
export const Route = createFileRoute('/api/visualize')({ server: { handlers: { POST: async ({ request }) => {
  const { getGatewayKey } = await import('@/lib/image-gateway.server'); const apiKey = getGatewayKey(request);
  if (!apiKey) return Response.json({ message: 'Image generation is not configured.' }, { status: 500 });
  try {
    const input = await request.formData();
    const settings = visualizationSchema.parse(JSON.parse(String(input.get('settings') ?? '{}')));
    const room = input.get('room'); const reference = input.get('reference'); const previous = input.get('previous'); const mask = input.get('mask');
    const validFile = (file: FormDataEntryValue | null): file is File => file instanceof File && file.size > 0 && file.size <= 20 * 1024 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
    const house = !room; if ((room && !validFile(room)) || !validFile(reference) || (previous && !validFile(previous)) || (mask && (!validFile(mask) || mask.type !== 'image/png'))) return Response.json({ message: 'Choose valid room and staircase photos (PNG, JPG or WebP, up to 20 MB each).' }, { status: 400 });
    const form = new FormData(); if (room instanceof File) form.append('image[]', room, 'room.png'); form.append('image[]', reference, 'staircase.png'); if (previous instanceof File) form.append('image[]', previous, 'previous.png'); if (!house && mask instanceof File) form.append('mask', mask, 'mask.png');
    form.set('prompt', house ? buildHousePrompt(settings, previous instanceof File) : buildVisualizationPrompt(settings, previous instanceof File)); form.set('stream', String(input.get('stream') !== 'false'));
    const { editImage } = await import('@/lib/image-gateway.server');
    return editImage(apiKey, form);
  } catch (error) { if (error instanceof SyntaxError || (error instanceof Error && error.name === 'ZodError')) return Response.json({ message: 'Invalid placement or image settings.' }, { status: 400 }); throw error; }
} } } });
