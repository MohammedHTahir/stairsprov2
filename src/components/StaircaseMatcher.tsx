import { useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Layout = 'straight' | 'l-shaped' | 'u-shaped' | 'cantilevered';
type Wood = 'light-oak' | 'natural-oak' | 'walnut' | 'dark-walnut';
type Metal = 'matte-black' | 'anthracite' | 'brushed-steel';
type Support = 'central-spine' | 'side-stringer' | 'cantilevered';
type Match = {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  attribution: string;
  license: string;
  score: number;
};

const options = {
  layout: [
    { value: 'straight', label: 'Straight' },
    { value: 'l-shaped', label: 'L-shaped' },
    { value: 'u-shaped', label: 'U-shaped' },
    { value: 'cantilevered', label: 'Cantilevered / floating' },
  ],
  wood: [
    { value: 'light-oak', label: 'Light oak' },
    { value: 'natural-oak', label: 'Natural oak' },
    { value: 'walnut', label: 'Walnut' },
    { value: 'dark-walnut', label: 'Dark walnut' },
  ],
  metal: [
    { value: 'matte-black', label: 'Matte black' },
    { value: 'anthracite', label: 'Anthracite grey' },
    { value: 'brushed-steel', label: 'Brushed stainless steel' },
  ],
  support: [
    { value: 'central-spine', label: 'Central steel spine' },
    { value: 'side-stringer', label: 'Side steel stringer' },
    { value: 'cantilevered', label: 'Wall-mounted / hidden support' },
  ],
} as const;

function SelectField<T extends string>({ label, value, values, onChange }: {
  label: string;
  value: T;
  values: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return <label className="block min-w-0 text-sm">
    <span className="mb-2 block font-medium text-foreground">{label}</span>
    <select value={value} onChange={event => onChange(event.target.value as T)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15">
      {values.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
    </select>
  </label>;
}

export function StaircaseMatcher() {
  const [layout, setLayout] = useState<Layout>('straight');
  const [wood, setWood] = useState<Wood>('natural-oak');
  const [metal, setMetal] = useState<Metal>('matte-black');
  const [support, setSupport] = useState<Support>('central-spine');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [searched, setSearched] = useState(false);

  async function findMatch() {
    setLoading(true);
    setError('');
    setMatch(null);
    setSearched(true);
    try {
      const params = new URLSearchParams({ layout, wood, metal, support });
      const response = await fetch(`/api/inspiration?${params.toString()}`);
      const data = await response.json() as { match?: Match; message?: string };
      if (!response.ok || !data.match) throw new Error(data.message ?? 'No close staircase match was found. Try a different configuration.');
      setMatch(data.match);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not find a matching staircase. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a href="/" className="font-display text-2xl tracking-tight">Sahaab <span className="text-primary">Stair Studio</span></a>
        <span className="hidden text-xs text-muted-foreground sm:block">Timber · Steel · Glass</span>
      </div>
    </header>
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:py-14">
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Staircase finder</p>
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Find your staircase.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Choose the details of your staircase. Sahaab will find the closest real project photograph in its reference collection.</p>

        <div className="mt-8 space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4" /> Your configuration</div>
          <SelectField label="Staircase layout" value={layout} values={options.layout} onChange={setLayout} />
          <SelectField label="Timber tread colour" value={wood} values={options.wood} onChange={setWood} />
          <SelectField label="Steel finish" value={metal} values={options.metal} onChange={setMetal} />
          <SelectField label="Steel support style" value={support} values={options.support} onChange={setSupport} />
          <div className="rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">All matches follow Sahaab's signature look: open timber treads, structural steel and clear glass balustrades.</div>
          <Button className="h-12 w-full" onClick={findMatch} disabled={loading}>
            {loading ? <><LoaderCircle className="size-4 animate-spin" /> Finding closest match…</> : <><Search className="size-4" /> Find my staircase</>}
          </Button>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your result</p><h2 className="mt-1 font-display text-2xl">Closest staircase match</h2></div>
          {match && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"><Check className="size-3.5" /> Best match</span>}
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card">
          {match ? <>
            <div className="bg-muted"><img src={match.imageUrl} alt={match.title} className="max-h-[680px] min-h-72 w-full object-contain" /></div>
            <div className="space-y-3 p-5">
              <div><h3 className="text-lg font-semibold">{match.title}</h3><p className="mt-1 text-xs text-muted-foreground">{match.attribution}</p></div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <span className="text-xs text-muted-foreground">Reference photo · {match.license}</span>
                <a href={match.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">View original source <ArrowUpRight className="size-4" /></a>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">This is an existing staircase photograph selected from the reference collection, not a generated image.</p>
            </div>
          </> : <div className="flex min-h-[480px] flex-col items-center justify-center bg-muted/30 px-8 py-14 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border bg-card"><Search className="size-7 text-muted-foreground" /></div>
            <h3 className="font-display text-2xl">{loading ? 'Searching the reference collection' : searched ? 'No matching photo yet' : 'Your staircase will appear here'}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{loading ? 'Comparing the selected layout, timber, steel and support details.' : error || 'Choose your preferred staircase configuration, then find the closest real staircase photograph.'}</p>
            {error && <Button variant="outline" className="mt-5" onClick={findMatch} disabled={loading}>Try again</Button>}
          </div>}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0" /> Results are selected using configuration and image metadata. No AI image generation or image editing is used.</div>
      </section>
    </div>
    <footer className="border-t px-5 py-6 text-center text-xs text-muted-foreground">Sahaab Stair Studio · Real staircase references</footer>
  </main>;
}
