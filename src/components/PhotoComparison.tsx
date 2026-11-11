import { useState } from 'react';
export function PhotoComparison({ before, after, partial = false, label = 'Visualization' }: { before: string; after: string; partial?: boolean; label?: string }) {
  const [split, setSplit] = useState(50);
  return <div className="relative overflow-hidden bg-muted">
    <img src={after} alt={label} className={`block w-full transition-[filter] ${partial ? 'blur-2xl' : 'blur-0'}`} />
    <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}><img src={before} alt="Original room" className="h-full w-full object-fill" /></div>
    <div className="pointer-events-none absolute inset-y-0 border-l-2 border-primary-foreground" style={{ left: `${split}%` }}><span className="absolute top-1/2 -translate-x-1/2 rounded-full bg-background px-2 py-3 text-foreground shadow-lg">↔</span></div>
    <span className="absolute left-3 top-3 rounded bg-background/90 px-2 py-1 text-xs">Before</span><span className="absolute right-3 top-3 rounded bg-background/90 px-2 py-1 text-xs">{label}</span>
    <input type="range" min="0" max="100" value={split} onChange={e => setSplit(Number(e.target.value))} aria-label="Before and after comparison" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
  </div>;
}
