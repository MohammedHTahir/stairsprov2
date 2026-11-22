import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function AuthDialog({ open, onOpenChange, onAuthenticated }: { open: boolean; onOpenChange: (open: boolean) => void; onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<'signin'|'signup'|'reset'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
        if (error) throw error; toast.success('Password reset email sent.'); onOpenChange(false); return;
      }
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (!result.data.user) throw new Error('Authentication did not return a user.');
      if (mode === 'signup' && !result.data.session) { toast.success('Check your email to confirm your account.'); onOpenChange(false); return; }
      onAuthenticated(result.data.user); toast.success(mode === 'signup' ? 'Account created.' : 'Welcome back.'); onOpenChange(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Authentication failed.'); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Sign in to StairStudio AI'}</DialogTitle><DialogDescription>Save your staircase designs and access them across devices.</DialogDescription></DialogHeader><form className="space-y-3" onSubmit={submit}><Input type="email" autoComplete="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} />{mode !== 'reset' && <Input type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="Password (at least 8 characters)" required value={password} onChange={e => setPassword(e.target.value)} />}<Button type="submit" className="w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Sign in'}</Button></form><div className="flex flex-wrap justify-between gap-2 text-sm"><button className="text-muted-foreground underline" type="button" onClick={() => setMode(mode === 'reset' ? 'signin' : 'reset')}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button><button className="text-muted-foreground underline" type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Already have an account?' : 'Create account'}</button></div></DialogContent></Dialog>;
}
