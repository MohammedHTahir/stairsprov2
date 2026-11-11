import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, Box, Camera, Download, ExternalLink, Loader2, Maximize, ScanLine, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteRoomScan, getRoomScanFile, listRoomScans, saveRoomScan, validateRoomScan, type RoomScan } from "@/lib/room-scans";
import villa from "@/assets/villa-room.jpg.asset.json";

const RoomScanViewer = lazy(() => import("@/components/RoomScanViewer"));

export const Route = createFileRoute("/room-scans")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Whole-room scans — StairStudio AI" },
    { name: "description", content: "Import and explore a measured 3D room scan, including its staircase, as one complete space." },
    { property: "og:title", content: "Whole-room scans — StairStudio AI" },
    { property: "og:description", content: "Explore your room and staircase together in a full 3D scan." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RoomScans,
});

function RoomScans() {
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const [scans, setScans] = useState<RoomScan[]>([]);
  const [selected, setSelected] = useState<RoomScan | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dimensions, setDimensions] = useState<[number, number, number] | null>(null);
  const [revision, setRevision] = useState(0);
  const [captureOpen, setCaptureOpen] = useState(false);
  useEffect(() => {
    listRoomScans().then(setScans).catch((e: Error) => setError(e.message));
  }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const select = async (scan: RoomScan) => {
    const current = ++generation.current;
    setSelected(scan); setUrl(null); setLoading(true); setDimensions(null); setError("");
    try {
      const file = await getRoomScanFile(scan.id);
      if (current !== generation.current) return;
      if (!file) throw new Error("The scan file is missing on this device. Please import it again.");
      setUrl(URL.createObjectURL(file));
    } catch (e) {
      if (current !== generation.current) return;
      setError(e instanceof Error ? e.message : "Could not open this scan."); setLoading(false);
    }
  };
  const upload = async (file: File) => {
    setBusy(true); setError("");
    try {
      await validateRoomScan(file);
      const scan = await saveRoomScan(file);
      setScans(await listRoomScans());
      await select(scan);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not import the scan."); }
    finally { setBusy(false); }
  };
  const remove = async (scan: RoomScan) => {
    if (!confirm(`Delete "${scan.name}" from this device?`)) return;
    try {
      await deleteRoomScan(scan.id);
      if (selected?.id === scan.id) { generation.current++; setSelected(null); setUrl(null); setDimensions(null); setLoading(false); }
      setScans(await listRoomScans());
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete the scan."); }
  };
  const download = async () => {
    if (!selected) return;
    try {
      const file = await getRoomScanFile(selected.id);
      if (!file) throw new Error("The saved scan is missing.");
      const href = URL.createObjectURL(file);
      const a = document.createElement("a"); a.href = href; a.download = `${selected.name}.glb`; a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not download this scan."); }
  };

  return <main className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft /> StairStudio AI</Link></Button>
      <Button onClick={() => input.current?.click()} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Upload />} Import scan</Button>
      <input ref={input} className="hidden" type="file" accept=".glb" aria-label="Import room scan" onChange={(e) => {
        const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = "";
      }} />
    </header>
    <div className="flex flex-wrap items-end justify-between gap-4 py-6">
      <div><p className="mb-1 text-xs font-medium text-muted-foreground">ROOM + STAIRCASE</p><h1 className="font-display text-4xl">Whole-room scans</h1></div>
      <div className="flex gap-2"><Button asChild><Link to="/room-capture"><Camera /> Take photos</Link></Button><Button variant="outline" onClick={() => setCaptureOpen(true)}><ScanLine /> Scan tips</Button></div>
    </div>
    {error && <div role="alert" className="mb-4 border-l-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <section aria-label="Room scan viewer" className="relative h-[55svh] min-h-80 overflow-hidden bg-secondary md:h-[65svh]">
      {!selected ? <>
        <img src={villa.url} alt="Interior room awaiting a whole-room scan" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 px-6 text-center">
          <Box className="size-10 text-accent" />
          <h2 className="font-display text-3xl">Your entire space, in 3D</h2>
          <Button onClick={() => input.current?.click()} disabled={busy}><Upload /> Import room .glb</Button>
        </div>
      </> : <>
        {url && <Suspense fallback={null}><RoomScanViewer key={url} url={url} revision={revision}
          onReady={(size) => { setDimensions(size); setLoading(false); }}
          onError={(message) => { setError(message); setLoading(false); }} /></Suspense>}
        <div className="absolute left-3 top-3 max-w-[calc(100%-7rem)] bg-background/90 px-3 py-2 text-sm"><p className="truncate font-medium">{selected.name}</p><p className="text-xs text-muted-foreground">Original scan scale</p></div>
        <div className="absolute right-3 top-3 flex gap-1">
          <Button variant="outline" size="icon" aria-label="Fit room in view" title="Fit room in view" disabled={!dimensions} onClick={() => setRevision((v) => v + 1)}><Maximize /></Button>
          <Button variant="outline" size="icon" aria-label="Download original scan" title="Download original scan" onClick={() => void download()}><Download /></Button>
        </div>
        {loading && <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 text-sm" role="status"><Loader2 className="animate-spin" /> Opening room scan…</div>}
        {dimensions && <p className="absolute bottom-3 left-3 bg-background/90 px-3 py-2 text-xs">Scan bounds · {dimensions[0].toFixed(2)} × {dimensions[2].toFixed(2)} × {dimensions[1].toFixed(2)} m</p>}
      </>}
    </section>
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Scans stay on this device. Dimensions use the file’s original units; verify critical measurements on site.</p>
    <section className="mt-8">
      <h2 className="font-display text-2xl">Saved room scans <span className="font-sans text-sm text-muted-foreground">{scans.length}</span></h2>
      {scans.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No room scans yet.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scans.map((scan) => <div key={scan.id} className={`flex min-w-0 items-center gap-2 rounded-md border p-3 ${selected?.id === scan.id ? "border-accent bg-secondary" : "border-border bg-card"}`}>
          <Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start px-1 py-2" onClick={() => void select(scan)}><Box /><span className="min-w-0 text-left"><span className="block truncate">{scan.name}</span><span className="block text-xs font-normal text-muted-foreground">{(scan.bytes / 1024 / 1024).toFixed(1)} MB · {new Date(scan.createdAt).toLocaleDateString()}</span></span></Button>
          <Button variant="ghost" size="icon" aria-label={`Delete ${scan.name}`} onClick={() => void remove(scan)}><Trash2 /></Button>
        </div>)}
      </div>}
    </section>
    <Dialog open={captureOpen} onOpenChange={setCaptureOpen}><DialogContent className="max-h-[85svh] overflow-y-auto"><DialogHeader><DialogTitle className="font-display text-3xl font-normal">Capture an accurate room</DialogTitle></DialogHeader>
      <p className="text-sm leading-relaxed text-muted-foreground">A single photo cannot provide accurate room geometry. This web app imports finished scans; it does not access your phone’s LiDAR sensor.</p>
      <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed">
        <li>Scan the complete space in a dedicated scanning app. A supported LiDAR phone or tablet gives a stronger basis for scale; photograph every side of the stairs.</li>
        <li>Export a textured mesh as <strong>GLB</strong> with textures embedded, in metres. Export options may require a paid plan.</li>
        <li>Import the file here. Glass, mirrors, and hidden surfaces may be missing or distorted; check important dimensions against real measurements.</li>
      </ol>
      <Button asChild variant="outline"><a href="https://scaniverse.com/" target="_blank" rel="noopener noreferrer">Open Scaniverse <ExternalLink /></a></Button>
      <Button onClick={() => { setCaptureOpen(false); input.current?.click(); }}><Upload /> Import an existing scan</Button>
    </DialogContent></Dialog>
  </main>;
}