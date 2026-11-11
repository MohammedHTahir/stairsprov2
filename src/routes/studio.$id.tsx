import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Camera, Check, Download, Layers, Minus, Plus, RotateCcw, Ruler, Sparkles, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StairModel } from "@/components/StairModel";
import { deletePart, importPart, listParts, partUrl, updatePart } from "@/lib/imports";
import { getProject, saveProject, type Project } from "@/lib/projects";
import { Switch } from "@/components/ui/switch";
import {
  computeSpec, calibratedScale, DEFAULT_MOUNTING, DEFAULT_PLACEMENT, DESIGNS, getDesign, GLASS, mountingPoints, slideAlongWall, STRUCTURES, TREADS,
  type Finishes, type Mounting, type Placement, type StairParams,
} from "@/lib/stairs";
import { streamImage } from "@/lib/stream-image";
import villa from "@/assets/villa-room.jpg.asset.json";
import refStair from "@/assets/floating-stair.jpg.asset.json";

export const Route = createFileRoute("/studio/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Design studio — StairStudio AI" },
      { name: "description", content: "Place, tune and photoreal-render a floating glass staircase in a room photo." },
      { property: "og:title", content: "Design studio — StairStudio AI" },
      { property: "og:description", content: "Place, tune and photoreal-render a floating glass staircase in a room photo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Studio,
});

function CameraRig({ tilt }: { tilt: number }) {
  useFrame(({ camera }) => {
    camera.position.set(0, 1.5, 7);
    camera.rotation.set((-tilt * Math.PI) / 180, 0, 0);
  });
  return null;
}

async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  const s = Math.min(1, 1600 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.85);
}

function Studio() {
  const { id } = Route.useParams();
  const [project, setProject] = useState<Project | undefined>(() => getProject(id));
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [blend, setBlend] = useState<{ url?: string; final: boolean; error?: string } | null>(null);
  const [compare, setCompare] = useState(false);
  const [parts, setParts] = useState(() => listParts());
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const partId = project?.partId;
  useEffect(() => {
    if (!partId) return setModelUrl(null);
    let url: string | null = null;
    let live = true;
    partUrl(partId).then((u) => { url = u; if (live) setModelUrl(u); });
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [partId]);
  const [calib, setCalib] = useState<{ pts: { x: number; y: number }[] } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; angle: number } | null>(null);

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => {
      if (!saveProject(project)) toast.error("Storage is full — remove old projects to keep saving.");
    }, 400);
    return () => clearTimeout(t);
  }, [project]);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">This project could not be found on this device.</p>
        <Button asChild><Link to="/">Back to projects</Link></Button>
      </div>
    );
  }

  const design = getDesign(project.designId);
  const { params, placement, finishes } = project;
  const mounting = project.mounting ?? DEFAULT_MOUNTING;
  const spec = computeSpec(params);
  const scale = project.calibration ? calibratedScale(project.calibration, placement.z) : placement.scale;
  const anchors = mountingPoints(params, design.structure, mounting.wall);
  const photo = project.photo ?? villa.url;

  const update = (patch: Partial<Project>) => setProject((p) => (p ? { ...p, ...patch } : p));
  const setPlace = (patch: Partial<Placement>) => setProject((p) => (p ? { ...p, placement: { ...p.placement, ...patch } } : p));
  const setParams = (patch: Partial<StairParams>) => setProject((p) => (p ? { ...p, params: { ...p.params, ...patch } } : p));
  const setFinish = (patch: Partial<Finishes>) => setProject((p) => (p ? { ...p, finishes: { ...p.finishes, ...patch } } : p));
  const setMount = (patch: Partial<Mounting>) =>
    setProject((p) => (p ? { ...p, mounting: { ...(p.mounting ?? DEFAULT_MOUNTING), ...patch } } : p));

  const twoFinger = () => {
    const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
    return { dist: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  const onDown = (e: React.PointerEvent) => {
    if (calib) {
      if (calib.pts.length >= 2) return;
      const r = stageRef.current!.getBoundingClientRect();
      setCalib({ pts: [...calib.pts, { x: e.clientX - r.left, y: e.clientY - r.top }] });
      return;
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) gesture.current = twoFinger();
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const w = stageRef.current?.clientWidth ?? 400;
    if (pointers.current.size === 1) {
      const k = 6 / w;
      setProject((p) => {
        if (!p) return p;
        // Snapped to wall: slide only along the wall, floor stays locked.
        if ((p.mounting ?? DEFAULT_MOUNTING).wall) return { ...p, placement: slideAlongWall(p.placement, (e.clientX - prev.x) * k) };
        return { ...p, placement: { ...p.placement, x: p.placement.x + (e.clientX - prev.x) * k, y: p.placement.y - (e.clientY - prev.y) * k } };
      });
    } else if (pointers.current.size === 2 && gesture.current) {
      const g = twoFinger();
      const ratio = g.dist / gesture.current.dist;
      const dAng = g.angle - gesture.current.angle;
      gesture.current = g;
      setProject((p) => {
        if (!p) return p;
        const locked = (p.mounting ?? DEFAULT_MOUNTING).wall;
        return { ...p, placement: { ...p.placement, scale: Math.min(3, Math.max(0.2, p.placement.scale * ratio)), rotY: locked ? p.placement.rotY : p.placement.rotY - dAng } };
      });
    }
  };
  const onUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    const f = Math.exp(-e.deltaY * 0.0015);
    setPlace({ scale: Math.min(3, Math.max(0.2, placement.scale * f)) });
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      update({ photo: await downscale(file), render: undefined, calibration: undefined });
    } catch {
      toast.error("That photo couldn't be opened. Try a JPG or PNG.");
    }
  };

  const composite = async (): Promise<Blob> => {
    const stage = stageRef.current!;
    const gl = glRef.current!;
    const c = document.createElement("canvas");
    c.width = gl.width;
    c.height = gl.height;
    const ctx = c.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photo;
    await img.decode();
    const s = Math.max(c.width / img.width, c.height / img.height);
    ctx.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
    ctx.drawImage(gl, 0, 0);
    void stage;
    return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/png"));
  };

  const runBlend = async () => {
    setBlend({ final: false });
    try {
      const blob = await composite();
      const form = new FormData();
      form.append("image", new File([blob], "scene.png", { type: "image/png" }));
      form.append(
        "prompt",
        `This is a real interior photo with a 3D-rendered staircase composited on top. Re-render it as a single photorealistic architectural photograph in which the staircase is physically built into the room. Keep the staircase's exact position, size, perspective, shape and number of steps (${params.steps}), and keep the rest of the room unchanged. Treads: ${TREADS[finishes.tread].label} with realistic grain and edges. Structure: ${STRUCTURES[finishes.structure].label}. Balustrade: frameless ${GLASS[finishes.glass].label.toLowerCase()} glass with realistic reflections and refraction of the room. Match the room's light direction, intensity and colour temperature, and add soft contact shadows where the staircase meets the floor and walls.`,
      );
      await streamImage("/api/blend", form, (url, final) => setBlend({ url, final }));
    } catch (err) {
      setBlend({ final: true, error: err instanceof Error ? err.message.replace(/^Image generation failed: /, "") : "Render failed" });
    }
  };

  const exportSpec = () => {
    const lines = [
      `StairStudio AI — Dimensional specification`,
      `Project: ${project.name}${project.client ? ` · Client: ${project.client}` : ""}`,
      `Design: ${design.name} (${design.structure} structure)`,
      ``,
      `Floor-to-floor height: ${spec.heightMm} mm`,
      `Number of risers: ${params.steps}`,
      `Riser height: ${spec.riserMm} mm`,
      `Going (tread depth): ${spec.goingMm} mm`,
      `Stair width: ${spec.widthMm} mm`,
      `Total run: ${spec.runMm} mm`,
      `Stringer length: ${spec.stringerMm} mm`,
      `Pitch: ${spec.pitchDeg}°`,
      `2R + G: ${spec.blondelMm} mm (${spec.comfortable ? "within comfort range" : "outside 550–700 mm comfort range"})`,
      `Glass balustrade height above nosing: 950 mm`,
      ``,
      `Scale: ${project.calibration ? `measured from photo (reference ${Math.round(project.calibration.meters * 1000)} mm)` : "visual estimate"}`,
      `Mounting: ${mounting.wall ? `wall-mounted, ${Math.round(mounting.gap * 1000)} mm shadow gap` : "free-standing"}`,
      `Wall brackets: ${anchors.filter((a) => a.kind === "wall").length} (${anchors.find((a) => a.kind === "wall")?.bolts ?? 0} bolts each)`,
      ...(anchors.some((a) => a.kind === "floor") ? [`Floor shoe: 1 (4 anchor bolts)`, `Top slab plate: 1 (4 anchor bolts)`] : []),
      ...anchors.filter((a) => a.kind === "wall").map((a, i) => `  Bracket ${i + 1}: ${Math.round(a.x * 1000)} mm along, ${Math.round(a.y * 1000)} mm up`),
      ``,
      `Treads: ${TREADS[finishes.tread].label}`,
      `Glass: ${GLASS[finishes.glass].label}`,
      `Structure: ${STRUCTURES[finishes.structure].label}`,
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    a.download = `${project.name.replace(/\W+/g, "-")}-spec.txt`;
    a.click();
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back">
          <Link to="/"><ArrowLeft /></Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl leading-tight">{project.name}</h1>
          <p className="truncate text-xs text-muted-foreground">{parts.find((x) => x.id === project.partId)?.name ?? design.name}{project.client ? ` · ${project.client}` : ""}</p>
        </div>
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary">
          <Camera className="size-4" /> Photo
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
        </label>
        <Button variant="outline" size="sm" onClick={() => setCatalogOpen(true)}><Layers /> Catalog</Button>
      </header>

      <div className="flex flex-1 flex-col md:flex-row min-h-0">
        <div
          ref={stageRef}
          className="relative min-h-[45vh] flex-1 touch-none select-none overflow-hidden bg-secondary"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={onWheel}
        >
          <img src={photo} alt="Room" className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />
          <Canvas
            className="!absolute inset-0"
            shadows
            dpr={[1, 2]}
            gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
            camera={{ fov: 45, position: [0, 1.5, 7] }}
            onCreated={({ gl }) => (glRef.current = gl.domElement)}
          >
            <CameraRig tilt={placement.tilt} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 8, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
            <Environment resolution={64}>
              <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
              <Lightformer intensity={1.2} color="#fff3e0" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
              <Lightformer intensity={0.8} position={[5, 2, 3]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
            </Environment>
            <group position={[placement.x, placement.y, placement.z]} rotation={[0, placement.rotY, 0]} scale={scale}>
              <StairModel params={params} finishes={finishes} structure={design.structure} mounting={mounting}
                imported={(() => { const part = parts.find((x) => x.id === project.partId); return part && modelUrl ? { url: modelUrl, part } : undefined; })()} />
              <ContactShadows position={[0, 0.003, 0]} scale={9} blur={2.5} opacity={0.5} far={3} />
            </group>
          </Canvas>
          {calib ? (
            <>
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {calib.pts.length === 2 && (
                  <line x1={calib.pts[0]!.x} y1={calib.pts[0]!.y} x2={calib.pts[1]!.x} y2={calib.pts[1]!.y} stroke="var(--primary)" strokeWidth={2} strokeDasharray="6 4" />
                )}
                {calib.pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={9} fill="var(--background)" stroke="var(--primary)" strokeWidth={3} />
                ))}
              </svg>
              <div className="absolute inset-x-3 top-3 rounded-xl bg-background/95 p-3 shadow-lg backdrop-blur" onPointerDown={(e) => e.stopPropagation()}>
                {calib.pts.length < 2 ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm">Tap {calib.pts.length === 0 ? "the start" : "the end"} of something you know the size of — a door height, floor to ceiling, a window.</p>
                    <Button size="sm" variant="ghost" onClick={() => setCalib(null)}>Cancel</Button>
                  </div>
                ) : (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const mm = Number(new FormData(e.currentTarget).get("mm"));
                      if (!(mm > 100)) {
                        toast.error("Enter the real length in millimetres.");
                        return;
                      }
                      const st = stageRef.current!;
                      const [a, b] = calib.pts as [{ x: number; y: number }, { x: number; y: number }];
                      update({
                        calibration: {
                          a: { x: a.x / st.clientWidth, y: a.y / st.clientHeight },
                          b: { x: b.x / st.clientWidth, y: b.y / st.clientHeight },
                          meters: mm / 1000,
                          aspect: st.clientWidth / st.clientHeight,
                        },
                      });
                      setCalib(null);
                      toast.success("Real scale locked");
                    }}
                  >
                    <span className="text-sm">Real length</span>
                    <input name="mm" type="number" inputMode="numeric" autoFocus defaultValue={2100} className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm tabular-nums" />
                    <span className="text-sm text-muted-foreground">mm</span>
                    <Button size="sm" type="submit">Apply</Button>
                    <Button size="sm" variant="ghost" type="button" onClick={() => setCalib({ pts: [] })}>Redo</Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              {project.calibration ? "Real scale · " : ""}
              {mounting.wall ? "Drag to slide along wall" : "Drag to move · twist to rotate"}
              {project.calibration ? "" : " · pinch to scale"}
            </div>
          )}
          <Button
            onClick={runBlend}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-6 shadow-lg"
            size="lg"
          >
            <Sparkles /> Photoreal blend
          </Button>
        </div>

        <aside className="max-h-[42vh] overflow-y-auto border-t border-border md:max-h-none md:w-96 md:border-l md:border-t-0">
          <Tabs defaultValue="place" className="p-3">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="place">Place</TabsTrigger>
              <TabsTrigger value="stair">Stair</TabsTrigger>
              <TabsTrigger value="finish">Finish</TabsTrigger>
              <TabsTrigger value="spec">Spec</TabsTrigger>
            </TabsList>

            <TabsContent value="place" className="space-y-5 pt-3">
              <div className="space-y-3 rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Mount to wall</p>
                    <p className="text-xs text-muted-foreground">Slides along the wall, floor locked. Set wall angle with Rotation.</p>
                  </div>
                  <Switch checked={mounting.wall} onCheckedChange={(v) => setMount({ wall: v })} aria-label="Mount to wall" />
                </div>
                {mounting.wall && (
                  <>
                    <Control label="Shadow gap to wall" value={`${Math.round(mounting.gap * 1000)} mm`}>
                      <Slider min={0} max={0.06} step={0.001} value={[mounting.gap]} onValueChange={([v]) => v !== undefined && setMount({ gap: v })} />
                    </Control>
                    <div className="flex items-center justify-between text-sm">
                      <span>Show wall guide</span>
                      <Switch checked={mounting.showWall} onCheckedChange={(v) => setMount({ showWall: v })} aria-label="Show wall guide" />
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground">
                  {anchors.filter((a) => a.kind === "wall").length} wall brackets
                  {anchors.some((a) => a.kind === "floor") ? " · floor shoe · top slab plate" : ""}
                </p>
              </div>

              <Control label="Floor alignment" value={`${placement.y.toFixed(2)} m`}>
                <Slider min={-2.5} max={1.5} step={0.01} value={[placement.y]} onValueChange={([v]) => v !== undefined && setPlace({ y: v })} />
              </Control>
              <Control label="Perspective tilt" value={`${placement.tilt.toFixed(0)}°`}>
                <Slider min={-5} max={30} step={0.5} value={[placement.tilt]} onValueChange={([v]) => v !== undefined && setPlace({ tilt: v })} />
              </Control>
              <Control label="Depth" value={`${placement.z.toFixed(2)} m`}>
                <Slider min={-6} max={3} step={0.01} value={[placement.z]} onValueChange={([v]) => v !== undefined && setPlace({ z: v })} />
              </Control>
              <Control label="Rotation" value={`${Math.round((placement.rotY * 180) / Math.PI)}°`}>
                <Slider min={-Math.PI} max={Math.PI} step={0.01} value={[placement.rotY]} onValueChange={([v]) => v !== undefined && setPlace({ rotY: v })} />
              </Control>
              {project.calibration ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 text-sm">
                  <span><span className="font-medium">Real scale locked</span><br /><span className="text-xs text-muted-foreground">Reference {Math.round(project.calibration.meters * 1000)} mm · Depth keeps true size</span></span>
                  <Button variant="ghost" size="sm" onClick={() => update({ calibration: undefined })}>Unlock</Button>
                </div>
              ) : (
                <Control label="Scale" value={`${Math.round(placement.scale * 100)}%`}>
                  <Slider min={0.2} max={3} step={0.01} value={[placement.scale]} onValueChange={([v]) => v !== undefined && setPlace({ scale: v })} />
                </Control>
              )}
              <Button variant="outline" className="w-full" onClick={() => setCalib({ pts: [] })}><Ruler /> {project.calibration ? "Re-measure real scale" : "Set real scale from photo"}</Button>
              <Button variant="ghost" size="sm" onClick={() => setPlace(DEFAULT_PLACEMENT)}><RotateCcw /> Reset placement</Button>
            </TabsContent>

            <TabsContent value="stair" className="space-y-5 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Steps</p>
                  <p className="text-xs text-muted-foreground">Riser {spec.riserMm} mm</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="icon" variant="outline" aria-label="Fewer steps" onClick={() => setParams({ steps: Math.max(6, params.steps - 1) })}><Minus /></Button>
                  <span className="w-8 text-center font-display text-2xl tabular-nums">{params.steps}</span>
                  <Button size="icon" variant="outline" aria-label="More steps" onClick={() => setParams({ steps: Math.min(24, params.steps + 1) })}><Plus /></Button>
                </div>
              </div>
              <Control label="Floor-to-floor height" value={`${spec.heightMm} mm`}>
                <Slider min={2.2} max={4.5} step={0.01} value={[params.height]} onValueChange={([v]) => v !== undefined && setParams({ height: v })} />
              </Control>
              <Control label="Going (tread depth)" value={`${spec.goingMm} mm`}>
                <Slider min={0.22} max={0.34} step={0.005} value={[params.going]} onValueChange={([v]) => v !== undefined && setParams({ going: v })} />
              </Control>
              <Control label="Width" value={`${spec.widthMm} mm`}>
                <Slider min={0.7} max={1.6} step={0.01} value={[params.width]} onValueChange={([v]) => v !== undefined && setParams({ width: v })} />
              </Control>
            </TabsContent>

            <TabsContent value="finish" className="space-y-5 pt-3">
              <Swatches title="Treads" items={TREADS} active={finishes.tread} onPick={(k) => setFinish({ tread: k })} />
              <Swatches title="Glass" items={GLASS} active={finishes.glass} onPick={(k) => setFinish({ glass: k })} />
              <Swatches title="Structure" items={STRUCTURES} active={finishes.structure} onPick={(k) => setFinish({ structure: k })} />
            </TabsContent>

            <TabsContent value="spec" className="space-y-3 pt-3">
              <dl className="grid grid-cols-2 gap-2">
                {[
                  ["Height", `${spec.heightMm} mm`], ["Risers", `${params.steps} × ${spec.riserMm} mm`],
                  ["Going", `${spec.goingMm} mm`], ["Width", `${spec.widthMm} mm`],
                  ["Total run", `${spec.runMm} mm`], ["Stringer", `${spec.stringerMm} mm`],
                  ["Pitch", `${spec.pitchDeg}°`], ["2R + G", `${spec.blondelMm} mm`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border bg-card p-2.5">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                    <dd className="text-sm font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className={`text-xs ${spec.comfortable ? "text-muted-foreground" : "text-destructive"}`}>
                {spec.comfortable ? "Within comfortable stair proportions." : "Check proportions: 2R + G should be 550–700 mm and pitch under 42°."}
              </p>
              <Button className="w-full" onClick={exportSpec}><Download /> Export specification</Button>
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      <Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader><SheetTitle className="font-display text-2xl font-normal">Staircase catalog</SheetTitle></SheetHeader>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {DESIGNS.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  update({ designId: d.id, params: { ...d.params }, finishes: { ...d.finishes }, partId: undefined });
                  setCatalogOpen(false);
                }}
                className={`overflow-hidden rounded-xl border text-left transition ${d.id === design.id && !project.partId ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-muted-foreground"}`}
              >
                {d.id === "oak-mono" ? (
                  <img src={refStair.url} alt={d.name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32">
                    <div className="flex-[3]" style={{ background: TREADS[d.finishes.tread].color }} />
                    <div className="flex-1" style={{ background: STRUCTURES[d.finishes.structure].color }} />
                    <div className="flex-1" style={{ background: GLASS[d.finishes.glass].color }} />
                  </div>
                )}
                <div className="p-3">
                  <p className="flex items-center gap-1.5 font-medium">{d.name}{d.id === design.id && !project.partId && <Check className="size-4" />}</p>
                  <p className="text-xs text-muted-foreground">{d.tagline}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3 border-t border-border p-4">
            <div>
              <h3 className="font-display text-xl">From Blender or CAD</h3>
              <p className="text-xs text-muted-foreground">
                Export as .glb (Blender: File › Export › glTF) or .obj (AutoCAD/Rhino/SketchUp). A <b>tread</b> is repeated on every step and resized to your going, width and steps. A <b>full staircase</b> is stretched to your height, run and width.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["tread", "full"] as const).map((mode) => (
                <label key={mode} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm font-medium hover:bg-secondary">
                  <Upload className="size-4" /> {mode === "tread" ? "Import tread" : "Import full stair"}
                  <input
                    type="file"
                    accept=".glb,.gltf,.obj"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      try {
                        const p = await importPart(f, mode);
                        setParts(listParts());
                        update({ partId: p.id });
                        toast.success(`${p.name} imported`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Import failed");
                      }
                    }}
                  />
                </label>
              ))}
            </div>
            {parts.map((p) => (
              <div key={p.id} className={`flex items-center gap-2 rounded-xl border p-2.5 ${project.partId === p.id ? "border-foreground" : "border-border"}`}>
                <button className="min-w-0 flex-1 text-left" onClick={() => { update({ partId: p.id }); setCatalogOpen(false); }}>
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium">{p.name}{project.partId === p.id && <Check className="size-4" />}</p>
                  <p className="text-xs text-muted-foreground">{p.mode === "tread" ? "Tread part" : "Full staircase"} · .{p.ext}</p>
                </button>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  Z-up
                  <Switch checked={p.zUp} onCheckedChange={(v) => { updatePart(p.id, { zUp: v }); setParts(listParts()); }} aria-label="Model is Z-up" />
                </label>
                <Button size="icon" variant="ghost" aria-label={`Delete ${p.name}`} onClick={async () => {
                  await deletePart(p.id);
                  setParts(listParts());
                  if (project.partId === p.id) update({ partId: undefined });
                }}><Trash2 /></Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {blend && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="font-display text-xl">Photoreal render</p>
            <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setBlend(null)}><X /></Button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-secondary p-3">
            {blend.error ? (
              <p className="max-w-sm text-center text-sm text-destructive">The render didn't finish: {blend.error}</p>
            ) : blend.url ? (
              <img
                src={compare ? photo : blend.url}
                alt="Photoreal staircase render"
                className={`max-h-full max-w-full rounded-lg object-contain transition-[filter] duration-700 ${blend.final ? "blur-0" : "blur-2xl"}`}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Sparkles className="size-8 animate-pulse" />
                <p className="text-sm">Matching light, shadows and glass reflections…</p>
              </div>
            )}
          </div>
          {blend.final && blend.url && !blend.error && (
            <div className="flex flex-wrap gap-2 border-t border-border p-3">
              <Button
                variant="outline"
                className="flex-1"
                onPointerDown={() => setCompare(true)}
                onPointerUp={() => setCompare(false)}
                onPointerLeave={() => setCompare(false)}
              >
                Hold to compare
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={blend.url} download={`${project.name}-render.png`}><Download /> Download</a>
              </Button>
              <Button className="flex-1" onClick={() => { update({ render: blend.url }); toast.success("Render saved to project"); }}>
                Save to project
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Control({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Swatches<K extends string>({
  title, items, active, onPick,
}: {
  title: string;
  items: Record<K, { label: string; color: string }>;
  active: K;
  onPick: (k: K) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(items) as K[]).map((k) => (
          <button
            key={k}
            onClick={() => onPick(k)}
            className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition ${k === active ? "border-foreground bg-card" : "border-border"}`}
          >
            <span className="size-6 shrink-0 rounded-md border border-border" style={{ background: items[k].color }} />
            {items[k].label}
          </button>
        ))}
      </div>
    </div>
  );
}
