import { createFileRoute, Link } from '@tanstack/react-router';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';
import { ArrowLeft, Building2, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { BuildingModel } from '@/components/BuildingModel';
import type { StairSystem } from '@/lib/building';

export const Route = createFileRoute('/building')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'Multi-floor stair shaft — StairStudio AI' },
    { name: 'description', content: 'Explore a continuous floating staircase climbing through a 3-storey structural building model.' },
    { property: 'og:title', content: 'Multi-floor stair shaft — StairStudio AI' },
    { property: 'og:description', content: 'Continuous spine or sawtooth staircase through translucent floor slabs and a structural core.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: BuildingPage,
});

const FLOOR_H = 3.2;
const PRESETS = {
  building: { pos: [16, 12, 16], target: [1, 4, 0] },
  stair: { pos: [5, 3.2, 7], target: [0.5, 1.6, 1] },
} as const;

function BuildingPage() {
  const [multi, setMulti] = useState(true);
  const [system, setSystem] = useState<StairSystem>('spine');
  const [opacity, setOpacity] = useState(0.3);
  const controls = useRef<OrbitImpl>(null);
  const go = (k: keyof typeof PRESETS) => { const c = controls.current; if (!c) return; const p = PRESETS[k]; c.object.position.set(p.pos[0], p.pos[1], p.pos[2]); c.target.set(p.target[0], p.target[1], p.target[2]); c.update(); };
  return (
    <main className="flex h-[100dvh] flex-col bg-background md:flex-row">
      <div className="relative min-h-[55dvh] flex-1 bg-secondary">
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 40, position: [16, 12, 16] }}>
          <color attach="background" args={['#f4f1ec']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 18, 8]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
          <Environment resolution={64}>
            <Lightformer intensity={2} position={[0, 8, 0]} scale={[12, 12, 1]} rotation-x={Math.PI / 2} />
            <Lightformer intensity={1} color="#fff3e0" position={[-8, 3, 0]} rotation-y={Math.PI / 2} scale={[20, 3, 1]} />
          </Environment>
          <BuildingModel floors={3} floorHeight={FLOOR_H} system={system} opacity={opacity} multi={multi} />
          <OrbitControls ref={controls} target={[1, 4, 0]} maxPolarAngle={Math.PI / 2 - 0.02} minDistance={2} maxDistance={40} makeDefault />
        </Canvas>
        <Button variant="secondary" size="icon" asChild className="absolute left-3 top-3" aria-label="Back"><Link to="/"><ArrowLeft /></Link></Button>
        <div className="absolute right-3 top-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => go('building')}><Building2 /> Building view</Button>
          <Button size="sm" variant="secondary" onClick={() => go('stair')}><Focus /> Stair</Button>
        </div>
      </div>
      <aside className="space-y-5 border-t p-4 md:w-80 md:border-l md:border-t-0">
        <h1 className="font-display text-2xl">Stair shaft</h1>
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-sm font-medium">Multi-floor building</p><p className="text-xs text-muted-foreground">3 storeys, slabs, voids, landings and core</p></div>
          <Switch checked={multi} onCheckedChange={setMulti} aria-label="Multi-floor building" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Stair system</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={system === 'spine' ? 'default' : 'outline'} onClick={() => setSystem('spine')}>A · Central spine</Button>
            <Button variant={system === 'sawtooth' ? 'default' : 'outline'} onClick={() => setSystem('sawtooth')}>B · Sawtooth</Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm"><span className="font-medium">Structure opacity</span><span className="tabular-nums text-muted-foreground">{Math.round(opacity * 100)}%</span></div>
          <Slider aria-label="Structure opacity" min={0.05} max={0.9} step={0.01} value={[opacity]} onValueChange={([v]) => v !== undefined && setOpacity(v)} disabled={!multi} />
          <p className="text-xs text-muted-foreground">5% shows the structural skeleton, 90% a solid shell.</p>
        </div>
        <p className="text-xs text-muted-foreground">Concept massing only — not structural engineering.</p>
      </aside>
    </main>
  );
}
