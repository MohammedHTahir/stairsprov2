import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useRouterState, Link, ClientOnly } from '@tanstack/react-router';
import { Camera, Upload, Plus, Sparkles, ArrowUpRight, Download, Save, FolderOpen, X, Check, Crosshair, Pencil, RotateCcw, LogOut, UserRound, Loader2, Box } from 'lucide-react';
const WorldViewer = lazy(() => import('./WorldViewer'));
import type { World } from './WorldViewer';
type WorldState = { status: 'building'; progress: string } | { status: 'ready'; world: World } | { status: 'error'; message: string };
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PhotoComparison } from './PhotoComparison';
import { supabase } from '@/integrations/supabase/client';
import { exampleRoom, exampleResult, products } from '@/lib/visualization-library';
import { defaultSettings, visualizationSchema, treadColors, metalColors, wallStyles, floorStyles, lightingStyles, type VisualizationSettings } from '@/lib/visualization';
import { imageBlob, saveWorld, saveVisualization, listVisualizations, openVisualization } from '@/lib/visualization-projects';
import { streamImage } from '@/lib/stream-image';
import type { User } from '@supabase/supabase-js';
type History = { src: string; instruction: string; saved: boolean; id?: string };
async function normalizePhoto(file: File) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) throw new Error('Use a JPG, PNG or WebP photo up to 20 MB.');
  const bitmap = await createImageBitmap(file); const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale); canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close(); return canvas.toDataURL('image/png');
}
export function VisualizationWorkspace() {
  const router = useRouter();
  const routerStatus = useRouterState({ select: state => state.status });
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState(exampleRoom); const [reference, setReference] = useState(products[0]?.image ?? ''); const [productId, setProductId] = useState('floating');
  const [settings, setSettings] = useState<VisualizationSettings>(defaultSettings);
  const [history, setHistory] = useState<History[]>([]); const [active, setActive] = useState(-1); const [preview, setPreview] = useState(''); const [busy, setBusy] = useState(false); const [partial, setPartial] = useState(false); const [error, setError] = useState('');
  const [mode, setMode] = useState<'none'|'start'|'landing'|'region'>('none'); const [drawing, setDrawing] = useState(false);
  const [tab, setTab] = useState<'design'|'placement'>('design'); const [view, setView] = useState<'compare'|'original'|'result'>('compare');
  const [name, setName] = useState('Stone wall residence'); const [projectId, setProjectId] = useState<string>(); const [savedOpen, setSavedOpen] = useState(false); const [saved, setSaved] = useState<Awaited<ReturnType<typeof listVisualizations>>>([]); const [saving, setSaving] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); const [displayName, setDisplayName] = useState(''); const [company, setCompany] = useState('');
  const [viewer3d, setViewer3d] = useState(false); const [worlds, setWorlds] = useState<Record<string, WorldState>>({}); const [resetKey, setResetKey] = useState(0);
  const roomInput = useRef<HTMLInputElement>(null); const cameraInput = useRef<HTMLInputElement>(null); const referenceInput = useRef<HTMLInputElement>(null);
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, [routerStatus]);
  const result = history[active]?.src ?? ''; const historyRef = useRef(history); historyRef.current = history;
  const update = (patch: Partial<VisualizationSettings>) => setSettings(s => ({ ...s, ...patch }));
  const reset = () => { setRoom(exampleRoom); setReference(products[0]?.image ?? ''); setProductId('floating'); setSettings(defaultSettings); setHistory([]); setActive(-1); setProjectId(undefined); setName('Untitled room'); setPreview(''); setError(''); setTab('design'); setMode('none'); };
  const upload = async (file: File | undefined, isRoom: boolean) => { if (!file) return; try { const src = await normalizePhoto(file); if (isRoom) { setRoom(src); setHistory([]); setActive(-1); setSettings(defaultSettings); setProjectId(undefined); setPreview(''); setName(file.name.replace(/\.[^.]+$/, '')); } else { setReference(src); setProductId('custom'); } } catch(e) { toast.error(e instanceof Error ? e.message : 'Could not open photo.'); } };
  const pointerPoint = (event: React.PointerEvent<SVGSVGElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) }; };
  async function makeMask() {
    if (settings.region.length < 3) return null;
    const bitmap = await createImageBitmap(await imageBlob(room)); const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height; bitmap.close(); const ctx = canvas.getContext('2d'); if (!ctx) return null;
    ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); settings.region.forEach((p,i) => i ? ctx.lineTo(p.x*canvas.width,p.y*canvas.height) : ctx.moveTo(p.x*canvas.width,p.y*canvas.height)); ctx.closePath(); ctx.fill(); return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  }
  async function generate(refine = false) {
    if (busy || !room || !reference) return;
    setBusy(true); setError(''); setPreview(''); setPartial(true);
    try {
            const form = new FormData(); form.append('reference', await imageBlob(reference), 'reference.png');
      if (refine && result) form.append('previous', await imageBlob(result), 'previous.png');
      form.append('settings', JSON.stringify({ ...settings, refinement: refine ? settings.refinement : '', referenceKind: productId === 'spiral' ? 'spiral' : productId === 'support-b' ? 'side' : products.find(p => p.id === productId)?.type === 'Support component' ? 'support' : 'complete' }));
      let final = ''; await streamImage('/api/visualize', form, (src, isFinal) => { setPreview(src); setPartial(!isFinal); if (isFinal) final = src; });
      if (!final) throw new Error('The visualization did not finish.');
      const item = { src: final, instruction: refine ? settings.refinement : 'Initial visualization', saved: false }; setHistory(h => [...h, item]); setActive(history.length); setPreview(''); setView('result'); update({ refinement: '' });
    } catch(e) { setPreview(''); setError(e instanceof Error ? e.message : 'Image generation failed.'); } finally { setBusy(false); setPartial(false); }
  }
  async function save() {
    if (!user) return; setSaving(true);
    try { const id = await saveVisualization(name.trim() || 'Untitled room', room, reference, settings, history.filter(h => !h.saved).map(h => { const w = worlds[h.src]; return { ...h, world: w?.status === 'ready' ? w.world : undefined }; }), projectId); setProjectId(id.projectId); const unsaved = history.filter(h => !h.saved); setHistory(h => h.map(i => i.saved ? i : { ...i, saved: true, ...(id.ids[unsaved.indexOf(i)] ? { id: id.ids[unsaved.indexOf(i)]! } : {}) })); toast.success('Project saved privately.'); } catch(e) { toast.error(e instanceof Error ? e.message : 'Could not save.'); } finally { setSaving(false); }
  }
  async function openSaved() { if (!user) return; setSavedOpen(true); try { setSaved(await listVisualizations()); } catch(e) { toast.error(e instanceof Error ? e.message : 'Could not load projects.'); } }
  async function openProject(id: string) { try { const data = await openVisualization(id); setProjectId(id); setName(data.project.name); setRoom(data.room); setReference(data.reference); setProductId('custom'); setSettings(visualizationSchema.parse(data.project.settings)); setHistory(data.history.map(({ world: _w, ...h }) => h)); setWorlds(Object.fromEntries(data.history.filter(h => h.world).map(h => [h.src, { status: 'ready' as const, world: h.world! }]))); setActive(data.history.length-1); setSavedOpen(false); } catch(e) { toast.error(e instanceof Error ? e.message : 'Could not open project.'); } }
  async function download() { if (!result) return; const url = URL.createObjectURL(await imageBlob(result)); const a = document.createElement('a'); a.href = url; a.download = `${name || 'stair-visualization'}.png`; a.click(); URL.revokeObjectURL(url); }
  async function build3d() {
    const src = result; if (!src || worlds[src]?.status === 'building') return;
    const set = (state: WorldState) => setWorlds(w => ({ ...w, [src]: state }));
    set({ status: 'building', progress: 'Sending your picture…' });
    try {
      const auth = async () => ({});
      const bitmap = await createImageBitmap(await imageBlob(src)); const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale); canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const jpeg = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.92)); if (!jpeg) throw new Error('Could not prepare the picture.');
      const form = new FormData(); form.append('image', jpeg, 'room.jpg');
      const res = await fetch('/api/world', { method: 'POST', body: form, headers: await auth() });
      const started = await res.json() as { operationId?: string; message?: string }; if (!res.ok || !started.operationId) throw new Error(started.message ?? 'Could not start the 3D room.');
      for (let i = 0; i < 180; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const poll = await fetch(`/api/world?op=${started.operationId}`, { headers: await auth() });
        const json = await poll.json() as { done?: boolean; progress?: string; message?: string; splat?: string; scale?: number; ground?: number };
        if (!poll.ok) throw new Error(json.message ?? 'The 3D room could not be built.');
        if (json.done && json.splat) { const world = { splat: json.splat, scale: json.scale ?? 1, ground: json.ground ?? 0 }; set({ status: 'ready', world }); const savedId = historyRef.current.find(h => h.src === src)?.id; if (savedId) { try { await saveWorld(savedId, world); toast.success('3D room saved to your project.'); } catch { toast.error('3D room built, but it could not be saved.'); } } else toast.success('3D room ready — save the project to keep it.'); return; }
        set({ status: 'building', progress: json.progress ?? 'Building your 3D room…' });
      }
      throw new Error('The 3D room is taking too long. Please try again.');
    } catch(e) { set({ status: 'error', message: e instanceof Error ? e.message : 'Could not build the 3D room.' }); }
  }
  async function openProfile() { if (!user) return; const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(); setDisplayName(data?.display_name ?? ''); setCompany(data?.company ?? ''); setProfileOpen(true); }
  return <main className="min-h-screen bg-background">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-8">
      <Link to="/" className="font-display text-2xl">StairStudio <span className="text-accent">AI</span></Link>
      <div className="flex items-center gap-1"><Button variant="ghost" size="sm" asChild><Link to="/building"><Box /> Building</Link></Button><Button variant="ghost" size="icon" title="New visualization" aria-label="New visualization" disabled={busy} onClick={reset}><Plus /></Button></div>
    </header>
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Photo visualization studio</p><h1 className="font-display text-4xl md:text-5xl">Your staircase. A real home.</h1></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-accent" /> Architecture-first visualization</div></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Input aria-label="Project name" value={name} onChange={e => setName(e.target.value)} className="h-8 max-w-[230px] border-none bg-transparent px-0 font-medium shadow-none" /><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Download result" title="Download result" disabled={!result || busy} onClick={download}><Download /></Button><Button size="sm" variant="outline" aria-label="View in 3D" disabled={!result || busy} onClick={() => setViewer3d(true)}><Box /> 3D</Button></div></div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="relative"><img src={preview || result || exampleResult} alt="Staircase visualization" className={`block w-full ${partial && preview ? 'blur-sm' : ''}`} /><span className="absolute left-3 top-3 rounded bg-background/90 px-2 py-1 text-xs">{preview || result ? 'Visualization' : 'Example'}</span></div>
          </div>
          {mode !== 'none' && <p className="mt-2 text-sm text-accent">{mode === 'start' ? 'Floor starting point' : mode === 'landing' ? 'Upper landing point' : 'Editable staircase region'}</p>}
          {busy && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> {partial && preview ? 'Rendering the final details…' : 'Creating your room visualization…'}</p>}
          {error && <p role="alert" className="mt-3 break-words rounded-md border border-destructive/40 p-3 text-sm text-destructive">{error}</p>}
          <p className="mt-3 text-xs text-muted-foreground">Concept visualization · not a construction drawing or structural assessment.</p>
          {history.length > 0 && <div className="mt-6"><h2 className="mb-3 text-sm font-medium">Generation history <span className="text-muted-foreground">/ {history.length}</span></h2><div className="flex gap-3 overflow-x-auto pb-2">{history.map((h,i) => <Button key={i} variant="ghost" onClick={() => { setActive(i); setView('compare'); }} className={`h-auto w-28 shrink-0 overflow-hidden rounded-md border p-0 ${active === i ? 'border-accent' : ''}`} aria-label={`Open variation ${i+1}`}><img src={h.src} alt={`Variation ${i+1}`} className="aspect-[4/3] w-full object-cover" /></Button>)}</div></div>}
          {!result && <div className="mt-8 border-t pt-5"><div className="mb-3 flex justify-between"><h2 className="font-display text-2xl">A change of perspective</h2><span className="text-xs text-muted-foreground">Your supplied example</span></div><div className="max-w-md overflow-hidden rounded-md"><PhotoComparison before={exampleRoom} after={exampleResult} label="Example after" /></div></div>}
        </section>
        <aside className="min-w-0 border-t pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">01 <span className="ml-2">Staircase reference</span></h2><Button variant="ghost" size="icon" aria-label="Upload staircase reference" title="Upload staircase reference" disabled={busy} onClick={() => referenceInput.current?.click()}><Upload /></Button></div>
            {productId === 'custom' && <img src={reference} alt="Your staircase reference" className="mb-3 max-h-40 w-full rounded-md border object-contain" />}
            <div className="grid grid-cols-2 gap-3">{products.map(p => <Button key={p.id} variant="ghost" disabled={busy} className={`relative h-auto flex-col gap-0 overflow-hidden rounded-md border p-0 text-left ${productId === p.id ? 'border-accent ring-1 ring-accent' : 'border-border'}`} onClick={() => { setReference(p.image); setProductId(p.id); }}><img src={p.image} alt={p.name} className="aspect-[4/3] w-full bg-card object-contain" /><span className="w-full whitespace-normal px-2 pb-2 pt-1"><span className="block text-[11px] font-medium">{p.name}</span><span className="text-[10px] text-muted-foreground">{p.type}</span></span>{productId === p.id && <Check className="absolute right-2 top-2 rounded-full bg-accent text-accent-foreground" />}</Button>)}</div>
            <Button variant="outline" className="mt-3 w-full" onClick={() => referenceInput.current?.click()} disabled={busy}><Plus /> Upload your staircase</Button>
            <div className="mt-5 grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Layout<select aria-label="Staircase layout" value={settings.layout} onChange={e => update({ layout: e.target.value as VisualizationSettings['layout'] })} className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-xs text-foreground"><option value="reference">Match reference</option><option value="straight">Straight</option><option value="l-shaped">L-shaped</option><option value="u-shaped">U-shaped</option><option value="cantilevered">Cantilevered</option></select></label><label className="text-xs text-muted-foreground">Wood color<select aria-label="Wood color" value={settings.treadColor} onChange={e => update({ treadColor: e.target.value as VisualizationSettings['treadColor'] })} className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-xs text-foreground">{Object.entries(treadColors).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label><label className="text-xs text-muted-foreground">Metal color<select aria-label="Metal color" value={settings.metalColor} onChange={e => update({ metalColor: e.target.value as VisualizationSettings['metalColor'] })} className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-xs text-foreground">{Object.entries(metalColors).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label><label className="text-xs text-muted-foreground">Wall design<select aria-label="Wall design" value={settings.wallStyle} onChange={e => update({ wallStyle: e.target.value as VisualizationSettings['wallStyle'] })} className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-xs text-foreground">{Object.entries(wallStyles).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label><label className="text-xs text-muted-foreground">Floor style<select aria-label="Floor style" value={settings.floorStyle} onChange={e => update({ floorStyle: e.target.value as VisualizationSettings['floorStyle'] })} className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-xs text-foreground">{Object.entries(floorStyles).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label><div className="col-span-2"><label className="text-xs text-muted-foreground">Lighting<select aria-label="Lighting" value={settings.lighting} onChange={e => update({ lighting: e.target.value as VisualizationSettings['lighting'] })} className="mt-2 h-10 w-full rounded-md border bg-background px-2 text-xs text-foreground">{Object.entries(lightingStyles).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label></div></div><p className="mt-3 text-[11px] text-muted-foreground">Frameless glass side panel on every design except the spiral, which has its curved metal side panel.</p>
          </>
          <div className="mt-6 border-t pt-5"><Button className="h-12 w-full" disabled={busy || !room || !reference} onClick={() => generate(false)}>{busy ? <Loader2 className="animate-spin" /> : <Sparkles />}{result ? 'Generate another variation' : 'Generate visualization'}</Button><p className="mt-2 text-center text-[11px] text-muted-foreground">A new realistic home is created around your staircase.</p></div>
          {result && <form className="mt-6 space-y-3 border-t pt-5" onSubmit={e => { e.preventDefault(); generate(true); }}><h2 className="text-sm font-semibold">Refine this result</h2><Textarea aria-label="Refinement request" value={settings.refinement} maxLength={2000} onChange={e => update({ refinement: e.target.value })} placeholder="Change the treads to walnut…" /><Button type="submit" variant="outline" className="w-full" disabled={busy || !settings.refinement.trim()}><Sparkles /> Apply refinement</Button></form>}
        </aside>
      </div>
    </div>
    <input ref={roomInput} aria-label="Upload room photo" type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => upload(e.target.files?.[0],true)} /><input ref={cameraInput} aria-label="Capture room photo" type="file" capture="environment" accept="image/*" hidden onChange={e => upload(e.target.files?.[0],true)} /><input ref={referenceInput} aria-label="Upload reference photo" type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => upload(e.target.files?.[0],false)} />
    <Dialog open={savedOpen} onOpenChange={setSavedOpen}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Saved visualizations</DialogTitle></DialogHeader>{saved.length ? <div className="grid grid-cols-2 gap-3">{saved.map(p => <Button key={p.id} variant="outline" className="h-auto flex-col overflow-hidden p-0" onClick={() => openProject(p.id)}><img src={p.thumbnail} alt={p.name} className="aspect-[4/3] w-full object-cover" /><span className="w-full truncate p-2 text-left">{p.name}</span></Button>)}</div> : <p className="text-sm text-muted-foreground">No saved visualizations yet.</p>}</DialogContent></Dialog>
    <Dialog open={viewer3d} onOpenChange={setViewer3d}><DialogContent className="max-w-4xl p-3"><DialogHeader><DialogTitle>Walk through in 3D</DialogTitle></DialogHeader><div className="relative h-[60dvh] overflow-hidden rounded-md border bg-card">{(() => { const w = worlds[result]; if (w?.status === 'ready') return <ClientOnly fallback={null}><Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>}><WorldViewer world={w.world} resetKey={resetKey} /></Suspense></ClientOnly>; if (w?.status === 'building') return <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground"><Loader2 className="animate-spin" /><p>{w.progress}</p><p className="text-xs">This usually takes about 5 minutes. You can close this window and keep working.</p></div>; return <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">{result && <img src={result} alt="" className="max-h-[30dvh] rounded-md object-contain" />}<p className="max-w-md text-sm text-muted-foreground">Turn this picture into a full 3D room you can walk around. It takes about 5 minutes and uses one 3D credit.</p>{w?.status === 'error' && <p className="max-w-md text-sm text-destructive">{w.message}</p>}<Button onClick={build3d} disabled={!result}><Box /> {w?.status === 'error' ? 'Try again' : 'Build 3D room'}</Button></div>; })()}</div><div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">Drag to look · two fingers or W A S D to move · hold the arrows to walk. Areas the photo never showed are filled in by AI.</p><Button size="sm" variant="ghost" onClick={() => setResetKey(k => k + 1)}><RotateCcw /> Reset</Button></div></DialogContent></Dialog>
    <Dialog open={profileOpen} onOpenChange={setProfileOpen}><DialogContent><DialogHeader><DialogTitle>Account profile</DialogTitle></DialogHeader><form className="space-y-3" onSubmit={async e => { e.preventDefault(); if (!user) return; const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayName, company }); if (error) toast.error(error.message); else { toast.success('Profile saved.'); setProfileOpen(false); } }}><Input aria-label="Display name" placeholder="Name" maxLength={100} value={displayName} onChange={e => setDisplayName(e.target.value)} /><Input aria-label="Company" placeholder="Company" maxLength={200} value={company} onChange={e => setCompany(e.target.value)} /><Button type="submit" className="w-full">Save profile</Button></form></DialogContent></Dialog>
  </main>;
}
