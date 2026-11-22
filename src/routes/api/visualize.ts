import { createFileRoute } from '@tanstack/react-router';
import { authenticateRequest } from '@/integrations/supabase/auth-middleware';
import { visualizationSchema, buildVisualizationPrompt, buildHousePrompt } from '@/lib/visualization';
export const Route = createFileRoute('/api/visualize')({ server: { handlers: { POST: async ({ request }) => {
  const auth = await authenticateRequest(request); if ('response' in auth) return auth.response;
  const { getGatewayKey, getCloudflareAccountId } = await import('@/lib/image-gateway.server'); const apiKey = getGatewayKey();
  if (!apiKey || !getCloudflareAccountId()) return Response.json({ message: 'Cloudflare Workers AI is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.' }, { status: 503 });
  try {
    const input = await request.formData();
    const settings = visualizationSchema.parse(JSON.parse(String(input.get('settings') ?? '{}')));
    const room = input.get('room'); const reference = input.get('reference'); const previous = input.get('previous'); const mask = input.get('mask');
    const modelRoom = input.get('modelRoom'); const modelReference = input.get('modelReference'); const modelPrevious = input.get('modelPrevious');
    const validFile = (file: FormDataEntryValue | null): file is File => file instanceof File && file.size > 0 && file.size <= 20 * 1024 * 1024 && ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
    const house = !room; if ((room && !validFile(room)) || !validFile(reference) || (previous && !validFile(previous)) || (mask && (!validFile(mask) || mask.type !== 'image/png'))) return Response.json({ message: 'Choose valid room and staircase photos (PNG, JPG or WebP, up to 20 MB each).' }, { status: 400 });
    const form = new FormData();
    const validModelFile = (file: FormDataEntryValue | null): file is File => file instanceof File && file.size > 0 && file.size <= 2 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!validModelFile(modelReference)) return Response.json({ message: 'Could not prepare the staircase reference image.' }, { status: 400 });
    if (modelRoom !== null && !validModelFile(modelRoom)) return Response.json({ message: 'Could not prepare the room image.' }, { status: 400 });
    if (modelPrevious !== null && !validModelFile(modelPrevious)) return Response.json({ message: 'Could not prepare the previous result.' }, { status: 400 });
    if (modelRoom instanceof File) form.append('image[]', modelRoom, 'room.jpg');
    form.append('image[]', modelReference, 'staircase.jpg');
    if (modelPrevious instanceof File) form.append('image[]', modelPrevious, 'previous.jpg');
    form.set('prompt', house ? buildHousePrompt(settings, previous instanceof File) : buildVisualizationPrompt(settings, previous instanceof File)); form.set('stream', String(input.get('stream') !== 'false'));
    const { editImage } = await import('@/lib/image-gateway.server');
    return editImage(apiKey, form);
  } catch (error) { if (error instanceof SyntaxError || (error instanceof Error && error.name === 'ZodError')) return Response.json({ message: 'Invalid placement or image settings.' }, { status: 400 }); throw error; }
} } } });
