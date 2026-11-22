import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, ChevronDown, ExternalLink, Image as ImageIcon, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Inspiration = { id: string; title: string; imageUrl: string; sourceUrl: string; author: string; license: string; attribution: string };
type GalleryResponse = { images?: Inspiration[]; nextOffset?: number | null; message?: string };
const layouts = [
  { id: 'all', label: 'All stairs' }, { id: 'straight', label: 'Straight' }, { id: 'l-shaped', label: 'L-shaped' },
  { id: 'u-shaped', label: 'U-shaped' }, { id: 'spiral', label: 'Spiral' }, { id: 'floating', label: 'Floating' },
] as const;
const materials = [
  { id: 'all', label: 'All materials' }, { id: 'wood', label: 'Wood & timber' }, { id: 'glass', label: 'Glass railing' },
  { id: 'steel', label: 'Steel & metal' }, { id: 'stone', label: 'Stone & marble' },
] as const;
export function StaircaseGallery() {
  const [layout, setLayout] = useState('all');
  const [material, setMaterial] = useState('all');
  const [images, setImages] = useState<Inspiration[]>([]);
  const [offset, setOffset] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Inspiration | null>(null);
  const [detail, setDetail] = useState<Inspiration | null>(null);
  const [search, setSearch] = useState('');\n  const requestId = useRef(0);
  const load = useCallback(async (reset = false) => {
    const id = ++requestId.current;
    setLoading(true); setError('');
    try {
      const start = reset ? 0 : offset;
      const params = new URLSearchParams({ layout, material, offset: String(start ?? 0) });
      const response = await fetch(`/api/inspiration?${params}`);
      const data = await response.json() as GalleryResponse;
      if (!response.ok) throw new Error(data.message ?? 'Could not load staircase inspiration.');
      const next = data.images ?? [];
      if (id !== requestId.current) return;
      setImages(current => reset ? next : [...current, ...next.filter(item => !current.some(existing => existing.id === item.id))]);
      setOffset(data.nextOffset ?? null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not load staircase inspiration.';
      if (id === requestId.current) { setError(message); if (!reset) toast.error(message); }
    } finally { if (id === requestId.current) setLoading(false); }
  }, [layout, material, offset]);
  useEffect(() => { setImages([]); setOffset(0); void load(true); // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [layout, material]);
  const visible = images.filter(item => !search.trim() || item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()));
  const choose = (item: Inspiration) => { setSelected(item); setDetail(null); toast.success('Reference selected for your staircase design.'); };
  return <main className="min-h-screen bg-background">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-8">
      <Link to="/" className="font-display text-2xl">Sahaab <span className="text-accent">Stair Studio</span></Link>
      <div className="flex items-center gap-2"><span className="hidden text-xs text-muted-foreground sm:inline">Real staircase photography · design inspiration</span><Button variant="outline" size="sm" asChild><Link to="/building">Building workspace <ArrowUpRight /></Link></Button></div>
    </header>
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The staircase library</p><h1 className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">Find the staircase<br className="hidden sm:block" /> you have in mind.</h1><p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">Explore real-world staircase references, compare materials and save a look as the starting point for your design.</p></div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs text-muted-foreground"><ImageIcon className="size-4 text-accent" /> Open image library</div>
      </div>
      {selected && <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
        <img src={selected.imageUrl} alt={selected.title} className="h-28 w-full rounded-lg object-cover sm:w-44" />
        <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-accent">Selected inspiration</p><h2 className="mt-1 truncate font-medium capitalize">{selected.title}</h2><p className="mt-1 truncate text-xs text-muted-foreground">{selected.attribution}</p><a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs underline underline-offset-4">View original source <ExternalLink className="size-3" /></a></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setSelected(null)}>Clear</Button><Button size="sm" onClick={() => toast.success('This reference is selected. Continue in the Building workspace to configure your staircase.')}>Use this reference <Check /></Button></div>
      </div>}
      <div className="mb-5 flex flex-col gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2"><SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />{layouts.map(item => <Button key={item.id} size="sm" variant={layout === item.id ? 'default' : 'outline'} className="rounded-full" onClick={() => setLayout(item.id)}>{item.label}</Button>)}</div>
        <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Material</span>{materials.map(item => <Button key={item.id} size="sm" variant={material === item.id ? 'secondary' : 'ghost'} className="rounded-full" onClick={() => setMaterial(item.id)}>{item.label}</Button>)}<div className="ml-auto flex w-full items-center gap-2 sm:w-56"><Search className="size-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search this gallery…" className="h-9" /></div></div>
      </div>
      <div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-2xl">Explore designs</h2><p className="text-xs text-muted-foreground">{images.length} references loaded · filter to discover more</p></div><span className="text-xs text-muted-foreground">Images from Wikimedia Commons</span></div>
      {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error} <Button variant="link" size="sm" onClick={() => void load(true)}>Retry</Button></div>}
      {images.length === 0 && loading ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />)}</div> : visible.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visible.map(item => <article key={item.id} className={`group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg ${selected?.id === item.id ? 'ring-2 ring-accent' : ''}`}>
        <button type="button" onClick={() => setDetail(item)} className="relative block w-full overflow-hidden text-left"><img src={item.imageUrl} alt={item.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /><span className="absolute bottom-2 left-2 rounded-full bg-background/90 px-2 py-1 text-[10px] text-foreground">View details</span></button>
        <div className="p-3"><h3 className="line-clamp-2 min-h-9 text-sm font-medium capitalize">{item.title}</h3><p className="mt-1 truncate text-[10px] text-muted-foreground">{item.author} · {item.license}</p><Button size="sm" variant={selected?.id === item.id ? 'secondary' : 'outline'} className="mt-3 w-full" onClick={() => choose(item)}>{selected?.id === item.id ? <><Check /> Selected</> : 'Use as reference'}</Button></div>
      </article>)}</div> : <div className="rounded-xl border border-dashed p-12 text-center"><ImageIcon className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-medium">No matching images found</p><p className="mt-1 text-sm text-muted-foreground">Try another shape or material filter.</p></div>}
      <div className="flex justify-center py-8">{offset !== null && <Button variant="outline" onClick={() => void load()} disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Loading more</> : <>Load more images <ChevronDown /></>}</Button>}{offset === null && images.length > 0 && <p className="text-xs text-muted-foreground">You've reached the end of these results.</p>}</div>
      <p className="border-t pt-4 text-xs text-muted-foreground">Reference photographs are supplied by Wikimedia Commons contributors. Image rights and license details vary; open each source page before reusing an image outside this design reference experience.</p>
    </div>
    <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}><DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle className="capitalize">{detail?.title}</DialogTitle></DialogHeader>{detail && <><img src={detail.imageUrl} alt={detail.title} className="max-h-[65dvh] w-full rounded-lg bg-muted object-contain" /><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm">{detail.attribution}</p><a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs underline">Original file and license <ExternalLink className="size-3" /></a></div><Button onClick={() => choose(detail)}>Use as reference <Check /></Button></div></>}</DialogContent></Dialog>
  </main>;
}
