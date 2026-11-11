import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Download, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { zipSync } from "fflate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addPhoto, captureProgress, clearPhotos, deletePhoto, listPhotos, TARGET_PHOTOS, type CapturePhoto } from "@/lib/capture-photos";

export const Route = createFileRoute("/room-capture")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Capture a room in 3D — StairStudio AI" },
    { name: "description", content: "Take overlapping photos of a room and staircase to build a 3D model." },
    { property: "og:title", content: "Capture a room in 3D — StairStudio AI" },
    { property: "og:description", content: "Walk the room, snap overlapping photos, and build a 3D model." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: RoomCapture,
});

const TIPS = ["Start at a corner, aim at the stairs", "Take a step sideways, keep 60% overlap", "Capture the stairs from low and high", "Cover every wall and the ceiling edge", "Keep lighting even, avoid moving objects"];

function RoomCapture() {
  const video = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photos, setPhotos] = useState<CapturePhoto[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [camError, setCamError] = useState("");
  const [flash, setFlash] = useState(false);
  const [zipping, setZipping] = useState(false);

  useEffect(() => { listPhotos().then(setPhotos).catch(() => toast.error("Could not load saved photos")); }, []);
  useEffect(() => {
    const next: Record<string, string> = {};
    photos.forEach((p) => { next[p.id] = URL.createObjectURL(p.blob); });
    setThumbs(next);
    return () => Object.values(next).forEach(URL.revokeObjectURL);
  }, [photos]);

  useEffect(() => {
    let s: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false })
      .then((m) => { s = m; setStream(m); if (video.current) video.current.srcObject = m; })
      .catch(() => setCamError("Camera unavailable — allow camera access or add photos from your gallery."));
    return () => s?.getTracks().forEach((t) => t.stop());
  }, []);

  const save = async (blob: Blob) => { const p = await addPhoto(blob); setPhotos((prev) => [...prev, p]); };

  const shoot = () => {
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    setFlash(true); setTimeout(() => setFlash(false), 120);
    navigator.vibrate?.(30);
    c.toBlob((b) => { if (b) void save(b); }, "image/jpeg", 0.92);
  };

  const remove = async (id: string) => { await deletePhoto(id); setPhotos((p) => p.filter((x) => x.id !== id)); };
  const reset = async () => { if (!confirm("Delete all captured photos?")) return; await clearPhotos(); setPhotos([]); };

  const exportZip = async () => {
    setZipping(true);
    try {
      const files: Record<string, Uint8Array> = {};
      for (const [i, p] of photos.entries()) files[`room-${String(i + 1).padStart(3, "0")}.jpg`] = new Uint8Array(await p.blob.arrayBuffer());
      const zip = zipSync(files, { level: 0 });
      const href = URL.createObjectURL(new Blob([zip as BlobPart], { type: "application/zip" }));
      const a = document.createElement("a"); a.href = href; a.download = "room-capture.zip"; a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } finally { setZipping(false); }
  };

  const progress = captureProgress(photos.length);
  const tip = TIPS[photos.length % TIPS.length];

  return <main className="mx-auto flex min-h-svh max-w-3xl flex-col px-4 pb-6 pt-4">
    <header className="flex items-center justify-between gap-2 pb-3">
      <Button asChild variant="ghost" size="sm"><Link to="/room-scans"><ArrowLeft /> Room scans</Link></Button>
      {photos.length > 0 && <Button variant="ghost" size="sm" onClick={() => void reset()}><Trash2 /> Start over</Button>}
    </header>
    <h1 className="font-display text-3xl">Capture the room</h1>
    <p className="mb-3 text-sm text-muted-foreground">Walk slowly around the space and take overlapping photos.</p>

    <section className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-foreground sm:aspect-video">
      <video ref={video} autoPlay playsInline muted className="h-full w-full object-cover" />
      {!stream && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary p-6 text-center text-sm text-muted-foreground">
        {camError ? <><Camera className="size-8" />{camError}</> : <><Loader2 className="animate-spin" /> Starting camera…</>}
      </div>}
      {stream && <>
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-background/20" />)}</div>
        <p className="absolute left-3 right-3 top-3 rounded bg-background/85 px-3 py-2 text-center text-xs font-medium">{tip}</p>
      </>}
      {flash && <div className="absolute inset-0 bg-background" />}
    </section>

    <div className="mt-4 flex items-center justify-between gap-3">
      <Button variant="outline" size="icon" aria-label="Add photos from gallery" onClick={() => fileInput.current?.click()}><ImagePlus /></Button>
      <button type="button" aria-label="Take photo" disabled={!stream} onClick={shoot}
        className="size-20 rounded-full border-4 border-foreground bg-background shadow-md transition active:scale-90 disabled:opacity-40" />
      <div className="w-10 text-right text-sm font-medium tabular-nums">{photos.length}</div>
      <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
        const files = Array.from(e.target.files ?? []); e.target.value = "";
        for (const f of files) await save(f);
      }} />
    </div>

    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{photos.length} / {TARGET_PHOTOS} photos</span><span className="text-muted-foreground">{progress.label}</span></div>
      <div className="h-1.5 overflow-hidden rounded bg-secondary"><div className="h-full bg-accent transition-all" style={{ width: `${Math.min(100, (photos.length / TARGET_PHOTOS) * 100)}%` }} /></div>
    </div>

    {photos.length > 0 && <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
      {photos.map((p, i) => <div key={p.id} className="relative shrink-0">
        {thumbs[p.id] && <img src={thumbs[p.id]} alt={`Photo ${i + 1}`} className="h-20 w-16 rounded object-cover" />}
        <button type="button" aria-label={`Delete photo ${i + 1}`} onClick={() => void remove(p.id)} className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5"><X className="size-3" /></button>
      </div>)}
    </div>}

    <div className="mt-auto space-y-2 pt-6">
      <Button className="w-full" disabled={!progress.ready || zipping} onClick={() => void exportZip()}>
        {zipping ? <Loader2 className="animate-spin" /> : <Download />} Download photo set (.zip)
      </Button>
      <p className="text-center text-xs text-muted-foreground">Automatic 3D building needs a reconstruction service — connect one to turn this set into a .glb here.</p>
    </div>
  </main>;
}
