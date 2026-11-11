import { supabase } from '@/integrations/supabase/client';
import type { VisualizationSettings } from './visualization';
export async function imageBlob(src: string) { const response = await fetch(src); if (!response.ok) throw new Error('Could not load the photo.'); return response.blob(); }
async function upload(userId: string, projectId: string, blob: Blob) {
  const path = `${userId}/${projectId}/${crypto.randomUUID()}.${blob.type === 'image/png' ? 'png' : 'jpg'}`;
  const { error } = await supabase.storage.from('visualizations').upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  return path;
}
export type SavedWorld = { splat: string; scale: number; ground: number };
export function parseWorld(value: unknown): SavedWorld | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const w = value as Record<string, unknown>;
  return typeof w['splat'] === 'string' && /^https:\/\//.test(w['splat']) && typeof w['scale'] === 'number' && typeof w['ground'] === 'number' ? { splat: w['splat'], scale: w['scale'], ground: w['ground'] } : undefined;
}
export async function saveVisualization(name: string, room: string, reference: string, settings: VisualizationSettings, history: { src: string; instruction: string; world?: SavedWorld | undefined }[], id?: string) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Sign in to save this project.');
  const projectId = id ?? crypto.randomUUID();
  const [roomPath, referencePath] = await Promise.all([imageBlob(room).then(b => upload(user.id, projectId, b)), imageBlob(reference).then(b => upload(user.id, projectId, b))]);
  const { error: saveError } = await supabase.from('visualization_projects').upsert({ id: projectId, user_id: user.id, name, room_path: roomPath, reference_path: referencePath, settings, updated_at: new Date().toISOString() });
  if (saveError) throw saveError;
  const ids: string[] = [];
  for (const item of history) {
    const path = await upload(user.id, projectId, await imageBlob(item.src));
    const { data, error: imageError } = await supabase.from('visualization_images').insert({ project_id: projectId, user_id: user.id, image_path: path, instruction: item.instruction, world: item.world ?? null }).select('id').single();
    if (imageError) throw imageError;
    ids.push(data.id);
  }
  return { projectId, ids };
}
/** Attach a built 3D room to an already-saved picture. */
export async function saveWorld(imageId: string, world: SavedWorld) {
  const { error } = await supabase.from('visualization_images').update({ world }).eq('id', imageId);
  if (error) throw error;
}
export async function signedImage(path: string) { const { data, error } = await supabase.storage.from('visualizations').createSignedUrl(path, 3600); if (error) throw error; return data.signedUrl; }
export async function listVisualizations() {
  const { data, error } = await supabase.from('visualization_projects').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return Promise.all(data.map(async p => ({ ...p, thumbnail: await signedImage(p.room_path) })));
}
export async function openVisualization(id: string) {
  const { data: project, error } = await supabase.from('visualization_projects').select('*').eq('id', id).single(); if (error) throw error;
  const { data: images, error: imageError } = await supabase.from('visualization_images').select('*').eq('project_id', id).order('created_at'); if (imageError) throw imageError;
  const [room, reference, history] = await Promise.all([signedImage(project.room_path), signedImage(project.reference_path), Promise.all(images.map(async i => ({ id: i.id, src: await signedImage(i.image_path), instruction: i.instruction, saved: true, world: parseWorld(i.world) })))]);
  return { project, room, reference, history };
}
