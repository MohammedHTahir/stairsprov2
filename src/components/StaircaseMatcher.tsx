import { useState } from 'react';
import { Check, ImagePlus, Search, Shuffle, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  selectStaircaseImage,
  STAIRCASE_IMAGE_CATALOG,
  type StaircaseConfiguration,
  type StairLayout,
  type WoodFinish,
  type MetalFinish,
  type StairStyle,
  type EntryDirection,
  type StaircaseImageMatch,
} from '@/lib/staircase-image-catalog';

const options = {
  layout: [
    { value: 'straight', label: 'Straight' },
    { value: 'l-shaped', label: 'L-shaped' },
    { value: 'u-shaped', label: 'U-shaped' },
    { value: 'spiral', label: 'Spiral' },
  ],
  style: [
    { value: 'mono-stringer', label: 'Central steel support base' },
    { value: 'central-spine', label: 'Central steel spine' },
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
  entry: [
    { value: 'left', label: 'Left entry' },
    { value: 'right', label: 'Right entry' },
    { value: 'not-applicable', label: 'Not applicable' },
  ],
  landings: [
    { value: '0', label: 'No landing' },
    { value: '1', label: '1 landing' },
    { value: '2', label: '2 landings' },
  ],
  steps: Array.from({ length: 11 }, (_, index) => {
    const value = index + 10;
    return { value: String(value), label: `${value} steps` };
  }),
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

function DimensionField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block min-w-0 text-sm">
    <span className="mb-2 block font-medium text-foreground">{label} (mm)</span>
    <input type="number" min="1" value={value} onChange={event => onChange(Math.max(1, Number(event.target.value) || 1))} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/>
  </label>;
}

export function StaircaseMatcher() {
  const [configuration, setConfiguration] = useState<StaircaseConfiguration>({
    layout: 'straight',
    landingCount: 0,
    style: 'mono-stringer',
    wood: 'natural-oak',
    metal: 'matte-black',
    stepCount: 15,
    entryDirection: 'not-applicable',
    widthMm: 1000,
    totalRunMm: 4200,
    totalRiseMm: 2800,
    treadDepthMm: 280,
    treadThicknessMm: 40,
  });
  const [match, setMatch] = useState<StaircaseImageMatch | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof StaircaseConfiguration>(key: K, value: StaircaseConfiguration[K]) {
    setConfiguration(current => ({ ...current, [key]: value }));
    setMatch(null);
    setError('');
    setSearched(false);
  }

  function findMatch() {
    setError('');
    setSearched(true);
    const selected = selectStaircaseImage(configuration, STAIRCASE_IMAGE_CATALOG, Math.random, match?.image.id);
    setMatch(selected);
    if (!selected) setError(`No verified ${configuration.layout} reference with ${configuration.layout === 'straight' ? `${configuration.landingCount ?? 0} intermediate landing(s), ` : ''}central steel support, open risers and glass railing is available yet. We will not substitute another layout or support construction.`);
  }

  const imageCount = STAIRCASE_IMAGE_CATALOG.length;
  const isDirectionalLayout = configuration.layout === 'l-shaped' || configuration.layout === 'u-shaped';

  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a href="/" className="font-display text-2xl tracking-tight">Sahaab <span className="text-primary">Stair Studio</span></a>
        <span className="hidden text-xs text-muted-foreground sm:block">Open riser · Glass railing</span>
      </div>
    </header>
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:py-14">
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Staircase finder</p>
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">Find your staircase.</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Configure the layout, central steel support, finishes and dimensions. Sahaab does not offer wall-mounted floating or side-supported stairs. The image is a visual reference; your dimensions remain the source of truth for the quotation.</p>
        <div className="mt-8 space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4" /> Your configuration</div>
          <SelectField label="Staircase layout" value={configuration.layout} values={options.layout} onChange={value => { update('layout', value as StairLayout); if (value !== 'straight') update('landingCount', 0); }} />
          {configuration.layout === 'straight' && <SelectField label="Choose landing" value={String(configuration.landingCount ?? 0)} values={options.landings} onChange={value => update('landingCount', Number(value) as 0 | 1 | 2)} />}
          <SelectField label="Structural / visual style" value={configuration.style} values={options.style} onChange={value => update('style', value as StairStyle)} />
          <SelectField label="Timber slab colour" value={configuration.wood} values={options.wood} onChange={value => update('wood', value as WoodFinish)} />
          <SelectField label="Steel finish" value={configuration.metal} values={options.metal} onChange={value => update('metal', value as MetalFinish)} />
          {isDirectionalLayout && <SelectField label="Entry direction" value={configuration.entryDirection} values={options.entry} onChange={value => update('entryDirection', value as EntryDirection)} />}
          <SelectField label="Number of steps" value={String(configuration.stepCount)} values={options.steps} onChange={value => update('stepCount', Number(value))} />
          <div className="grid grid-cols-2 gap-3">
            <DimensionField label="Overall width" value={configuration.widthMm ?? 1000} onChange={value => update('widthMm', value)} />
            <DimensionField label="Total run" value={configuration.totalRunMm ?? 4200} onChange={value => update('totalRunMm', value)} />
            <DimensionField label="Total rise" value={configuration.totalRiseMm ?? 2800} onChange={value => update('totalRiseMm', value)} />
            <DimensionField label="Tread depth" value={configuration.treadDepthMm ?? 280} onChange={value => update('treadDepthMm', value)} />
            <DimensionField label="Tread thickness" value={configuration.treadThicknessMm ?? 40} onChange={value => update('treadThicknessMm', value)} />
          </div>
          <div className="rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">Only central steel support-base / central-spine construction is supported. Floating/cantilevered, side-stringer, double-stringer and zig-zag structures are excluded. Glass panels must follow the exposed stair and landing edges and be visibly secured with proper clamps, posts or side-mounted fittings; detached or floating-looking panels are not acceptable. Every result must match the selected layout and landing count. Dimensions are retained as customer specifications and are never guessed from a photo.</div>
          <Button className="h-12 w-full" onClick={findMatch}>
            {match ? <><Shuffle className="size-4" /> Show another design</> : <><Search className="size-4" /> Find my staircase</>}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{imageCount} staircase image references in the catalog</p>
        </div>
      </section>
      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your result</p><h2 className="mt-1 font-display text-2xl">Selected staircase design</h2></div>
          {match && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"><Check className="size-3.5" /> {match.exact ? 'Exact style match' : 'Closest match'}</span>}
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card">
          {match ? <>
            <div className="bg-muted"><img src={match.image.imageUrl} alt={match.image.title} referrerPolicy="no-referrer" className="max-h-[680px] min-h-72 w-full object-contain" /></div>
            <div className="space-y-3 p-5">
              <div><h3 className="text-lg font-semibold">{match.image.title}</h3><p className="mt-1 text-xs capitalize text-muted-foreground">{match.image.layout} staircase · {match.image.stepCount ?? configuration.stepCount} steps{configuration.layout === 'straight' ? ` · ${configuration.landingCount ?? 0} landing${configuration.landingCount === 1 ? '' : 's'}` : ''}</p></div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.style}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.wood}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.metal}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">Open risers</span>
                <span className="rounded-full bg-muted px-2.5 py-1">Glass railing</span>
              </div>
              {!match.exact && <p className="text-xs leading-5 text-muted-foreground">An exact finish/step combination is not in the library yet. This is the closest eligible image for your selected layout and central steel support construction.</p>}
              <a href={match.image.sourceUrl || match.image.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline">View original image source <ExternalLink className="size-3" /></a>
              <p className="border-t pt-3 text-xs leading-5 text-muted-foreground">This photograph is a visual reference only. Your entered dimensions remain authoritative for engineering and quotation calculations.</p>
            </div>
          </> : <div className="flex min-h-[480px] flex-col items-center justify-center bg-muted/30 px-8 py-14 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border bg-card"><ImagePlus className="size-7 text-muted-foreground" /></div>
            <h3 className="font-display text-2xl">{searched ? 'No matching reference yet' : 'Your staircase will appear here'}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{error || 'Choose the staircase layout, style and finishes, then find a matching design.'}</p>
            {searched && <p className="mt-3 text-xs text-muted-foreground">Add remote image URLs to the catalog; no image files need to be stored in this repository.</p>}
          </div>}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0" /> External images are loaded directly from their source hosts. No AI generation or local image storage is used for remote references.</div>
      </section>
    </div>
    <footer className="border-t px-5 py-6 text-center text-xs text-muted-foreground">Sahaab Stair Studio · Open-riser staircase references</footer>
  </main>;
}
