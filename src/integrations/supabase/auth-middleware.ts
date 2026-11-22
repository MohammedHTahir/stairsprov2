// Verify Supabase access tokens against Auth before allowing paid AI operations.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
export async function authenticateRequest(request: Request) {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return { response: Response.json({ message: 'Supabase is not configured.' }, { status: 503 }) } as const;
  const match = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '');
  if (!match) return { response: Response.json({ message: 'Sign in to continue.' }, { status: 401 }) } as const;
  const client = createClient<Database>(url, key, { global: { headers: { Authorization: `Bearer ${match[1]}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await client.auth.getUser(match[1]);
  if (error || !data.user) return { response: Response.json({ message: 'Your session is invalid or expired. Please sign in again.' }, { status: 401 }) } as const;
  return { user: data.user, supabase: client } as const;
}
