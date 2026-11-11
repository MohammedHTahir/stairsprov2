import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SparkControls, SparkRenderer, SplatMesh } from '@sparkjsdev/spark';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type World = { splat: string; scale: number; ground: number };

/** Walkable Gaussian-splat room. Starts at the original photo's viewpoint. */
export default function WorldViewer({ world, resetKey }: { world: World; resetKey: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const walk = useRef(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.domElement.style.touchAction = 'none';
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f1ec);
    const camera = new THREE.PerspectiveCamera(65, el.clientWidth / el.clientHeight, 0.01, 1000);
    scene.add(new SparkRenderer({ renderer }));
    // Marble splats are in an OpenCV frame (y down, z forward): flip 180° about X for three.js,
    // scale to meters, and lift so the floor sits at y = 0. The source camera ends up at (0, ground, 0) looking -Z.
    const mesh = new SplatMesh({ url: world.splat });
    mesh.quaternion.set(1, 0, 0, 0);
    mesh.scale.setScalar(world.scale);
    mesh.position.y = world.ground;
    scene.add(mesh);
    mesh.initialized.then(() => setLoading(false)).catch(() => { setFailed(true); setLoading(false); });
    const start = () => { camera.position.set(0, world.ground, 0); camera.quaternion.identity(); };
    start(); resetRef.current = start;
    const controls = new SparkControls({ canvas: renderer.domElement });
    controls.fpsMovement.moveSpeed = 1.2;
    const timer = new THREE.Timer(); const forward = new THREE.Vector3();
    renderer.setAnimationLoop(() => {
      timer.update(); const dt = Math.min(timer.getDelta(), 0.05);
      controls.update(camera);
      if (walk.current) { camera.getWorldDirection(forward); forward.y = 0; forward.normalize(); camera.position.addScaledVector(forward, walk.current * 1.2 * dt); }
      renderer.render(scene, camera);
    });
    const resize = new ResizeObserver(() => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); });
    resize.observe(el);
    return () => { resize.disconnect(); renderer.setAnimationLoop(null); mesh.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [world]);

  useEffect(() => { resetRef.current(); }, [resetKey]);

  const hold = (dir: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); walk.current = dir; },
    onPointerUp: () => { walk.current = 0; }, onPointerLeave: () => { walk.current = 0; }, onPointerCancel: () => { walk.current = 0; },
  });

  return <div className="relative h-full w-full">
    <div ref={wrap} className="h-full w-full" />
    {loading && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/80 text-sm text-muted-foreground"><Loader2 className="animate-spin" /> Loading 3D room…</div>}
    {failed && <div className="absolute inset-0 flex items-center justify-center bg-card text-sm text-muted-foreground">The 3D room could not be loaded.</div>}
    <div className="absolute bottom-3 right-3 flex flex-col gap-2">
      <Button size="icon" variant="secondary" aria-label="Walk forward" className="select-none" {...hold(1)}><ArrowUp /></Button>
      <Button size="icon" variant="secondary" aria-label="Walk back" className="select-none" {...hold(-1)}><ArrowDown /></Button>
    </div>
  </div>;
}
