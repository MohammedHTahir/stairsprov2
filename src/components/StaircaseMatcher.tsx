import { useState } from 'react';
import { Check, ImagePlus, Search, Shuffle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  selectStaircaseImage,
  STAIRCASE_IMAGE_CATALOG,
  type StaircaseConfiguration,
  type StairLayout,
  type WoodFinish,
  type GlassOption,
  type MetalFinish,
  type SupportStyle,
  type StaircaseImageMatch,
} from '@/lib/staircase-image-catalog';

const options = {
  layout: [
    { value: 'straight', label: 'Straight' },
    { value: 'l-shaped', label: 'L-shaped' },
    { value: 'u-shaped', label: 'U-shaped' },
    { value: 'spiral', label: 'Spiral' },
    { value: 'cantilevered', label: 'Cantilevered / floating' },
  ],
  wood: [
    { value: 'light-oak', label: 'Light oak' },
    { value: 'natural-oak', label: 'Natural oak' },
    { value: 'walnut', label: 'Walnut' },
    { value: 'dark-walnut', label: 'Dark walnut' },
  ],
  glass: [
    { value: 'with-glass', label: 'With side glass panels' },
    { value: 'without-glass', label: 'Without glass panels' },
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

export function StaircaseMatcher() {
  const [configuration, setConfiguration] = useState<StaircaseConfiguration>({
    layout: 'straight',
    wood: 'natural-oak',
    glass: 'with-glass',
    metal: 'matte-black',
    support: 'central-spine',
    stepCount: 15,
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
    const selected = selectStaircaseImage(configuration);
    setMatch(selected);
    if (!selected) {
      setError(`No images have been added for the ${configuration.layout} staircase yet. Add images to the matching folder in src/assets/stairs and restart the development server.`);
    }
  }

  const imageCount = STAIRCASE_IMAGE_CATALOG.length;

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
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Configure your staircase and browse a randomly selected design from our curated image library.</p>

        <div className="mt-8 space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4" /> Your configuration</div>
          <SelectField label="Staircase layout" value={configuration.layout} values={options.layout} onChange={value => update('layout', value as StairLayout)} />
          <SelectField label="Timber tread colour" value={configuration.wood} values={options.wood} onChange={value => update('wood', value as WoodFinish)} />
          <SelectField label="Side glass panels" value={configuration.glass} values={options.glass} onChange={value => update('glass', value as GlassOption)} />
          <SelectField label="Steel finish" value={configuration.metal} values={options.metal} onChange={value => update('metal', value as MetalFinish)} />
          <SelectField label="Steel support style" value={configuration.support} values={options.support} onChange={value => update('support', value as SupportStyle)} />
          <SelectField label="Number of steps" value={String(configuration.stepCount)} values={options.steps} onChange={value => update('stepCount', Number(value))} />
          <div className="rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">The image selector always respects the chosen staircase layout. If an exact combination is unavailable, it selects the closest available finish and step-count match within that layout.</div>
          <Button className="h-12 w-full" onClick={findMatch}>
            {match ? <><Shuffle className="size-4" /> Show another design</> : <><Search className="size-4" /> Find my staircase</>}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{imageCount} staircase {imageCount === 1 ? 'image' : 'images'} currently available</p>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your result</p><h2 className="mt-1 font-display text-2xl">Selected staircase design</h2></div>
          {match && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"><Check className="size-3.5" /> {match.exact ? 'Exact match' : 'Closest match'}</span>}
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card">
          {match ? <>
            <div className="bg-muted"><img src={match.image.imageUrl} alt={match.image.title} className="max-h-[680px] min-h-72 w-full object-contain" /></div>
            <div className="space-y-3 p-5">
              <div><h3 className="text-lg font-semibold">{match.image.title}</h3><p className="mt-1 text-xs text-muted-foreground">{match.image.layout} staircase · {match.image.stepCount} steps</p></div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.wood}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.glass === 'with-glass' ? 'Side glass panels' : 'No glass panels'}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.metal}</span>
                <span className="rounded-full bg-muted px-2.5 py-1">{match.image.support}</span>
              </div>
              {!match.exact && <p className="text-xs leading-5 text-muted-foreground">An exact image combination is not in the library yet. This is the highest-scoring available image for your selected layout.</p>}
              <p className="border-t pt-3 text-xs leading-5 text-muted-foreground">This image is an existing design reference. Your selected dimensions and quotation specifications remain independent of the reference image.</p>
            </div>
          </> : <div className="flex min-h-[480px] flex-col items-center justify-center bg-muted/30 px-8 py-14 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border bg-card"><ImagePlus className="size-7 text-muted-foreground" /></div>
            <h3 className="font-display text-2xl">{searched ? 'No image available yet' : 'Your staircase will appear here'}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{error || 'Choose your preferred staircase configuration, then find a matching design from the image library.'}</p>
            {searched && imageCount === 0 && <p className="mt-3 text-xs text-muted-foreground">Add your first image under src/assets/stairs to get started.</p>}
          </div>}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0" /> Designs are selected locally using folder metadata and a deterministic matching score with random variation between equally suitable images. No external image service is used.</div>
      </section>
    </div>
    <footer className="border-t px-5 py-6 text-center text-xs text-muted-foreground">Sahaab Stair Studio · Curated staircase designs</footer>
  </main>;
}
