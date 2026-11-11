import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Turns a finished picture into a walkable 3D world (Gaussian splats) with World Labs Marble.
const API = 'https://api.worldlabs.ai/marble/v1';
const MODEL = 'marble-1.1';
const UUID = /^[0-9a-f-]{36}$/i;

async function authorize(_request: Request) {
  const apiKey = process.env['WORLDLABS_API_KEY'];
  if (!apiKey) return { error: Response.json({ message: '3D rooms are not configured.' }, { status: 500 }) };
  return { apiKey };
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer); let out = '';
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}

function upstreamError(status: number) {
  return status === 402 ? '3D credits are used up. Top up your World Labs credits to build more rooms.' : status === 429 ? 'Too many 3D requests, try again shortly.' : 'The 3D room service could not process this picture.';
}

type Operation = {
  done: boolean; error: { message?: string } | null;
  metadata: { progress?: { status?: string; description?: string } } | null;
  response: { assets?: { splats?: { spz_urls?: Record<string, string>; semantics_metadata?: { metric_scale_factor?: number; ground_plane_offset?: number } } } } | null;
};

export const Route = createFileRoute('/api/world')({ server: { handlers: {
  POST: async ({ request }) => {
    const auth = await authorize(request); if (auth.error) return auth.error;
    const input = await request.formData(); const image = input.get('image');
    if (!(image instanceof File) || image.size === 0 || image.size > 15 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(image.type)) return Response.json({ message: 'Invalid image.' }, { status: 400 });
    const extension = image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
    const res = await fetch(`${API}/worlds:generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'WLT-Api-Key': auth.apiKey }, body: JSON.stringify({
      display_name: 'StairStudio room', model: MODEL,
      world_prompt: { type: 'image', is_pano: false, image_prompt: { source: 'data_base64', data_base64: toBase64(await image.arrayBuffer()), extension } },
    }) });
    if (!res.ok) { console.error('World Labs generate failed', res.status, (await res.text().catch(() => '')).slice(0, 300)); return Response.json({ message: upstreamError(res.status) }, { status: res.status === 402 || res.status === 429 ? res.status : 502 }); }
    const json = await res.json() as { operation_id?: string };
    if (!json.operation_id) return Response.json({ message: 'The 3D room service did not start.' }, { status: 502 });
    return Response.json({ operationId: json.operation_id });
  },
  GET: async ({ request }) => {
    const auth = await authorize(request); if (auth.error) return auth.error;
    const op = new URL(request.url).searchParams.get('op') ?? '';
    if (!UUID.test(op)) return Response.json({ message: 'Invalid request.' }, { status: 400 });
    const res = await fetch(`${API}/operations/${op}`, { headers: { 'WLT-Api-Key': auth.apiKey } });
    if (!res.ok) return Response.json({ message: upstreamError(res.status) }, { status: 502 });
    const data = await res.json() as Operation;
    if (!data.done) return Response.json({ done: false, progress: data.metadata?.progress?.description ?? 'Building your 3D room…' });
    if (data.error) return Response.json({ done: true, message: 'The 3D room could not be built from this picture.' }, { status: 422 });
    const splats = data.response?.assets?.splats; const urls = splats?.spz_urls ?? {};
    const splat = urls['500k'] ?? urls['full_res'] ?? urls['100k'];
    if (!splat) return Response.json({ done: true, message: 'The 3D room finished without a model.' }, { status: 502 });
    return Response.json({ done: true, splat, scale: splats?.semantics_metadata?.metric_scale_factor ?? 1, ground: splats?.semantics_metadata?.ground_plane_offset ?? 0 });
  },
} } });
