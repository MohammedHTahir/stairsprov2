// Imported Blender / CAD models. Files live in IndexedDB (too big for localStorage);
// lightweight metadata lives in localStorage next to projects.

export type PartMode = "tread" | "full";
export type ImportedPart = {
  id: string;
  name: string;
  mode: PartMode;
  ext: "glb" | "gltf" | "obj";
  zUp: boolean;
  createdAt: number;
};

const META = "stairstudio.parts.v1";
const DB = "stairstudio";
const STORE = "parts";

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((res, rej) => {
    const req = fn(d.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export function listParts(): ImportedPart[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(META) || "[]") as ImportedPart[];
  } catch {
    return [];
  }
}
const writeMeta = (all: ImportedPart[]) => localStorage.setItem(META, JSON.stringify(all));

export function extOf(name: string): ImportedPart["ext"] | null {
  const e = name.toLowerCase().split(".").pop();
  return e === "glb" || e === "gltf" || e === "obj" ? e : null;
}

export async function importPart(file: File, mode: PartMode): Promise<ImportedPart> {
  const ext = extOf(file.name);
  if (!ext) throw new Error("Use a .glb, .gltf or .obj file");
  const part: ImportedPart = {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^.]+$/, ""),
    mode,
    ext,
    zUp: ext === "obj", // CAD OBJ exports are usually Z-up; glTF is always Y-up
    createdAt: Date.now(),
  };
  await tx("readwrite", (s) => s.put(file, part.id));
  writeMeta([part, ...listParts()]);
  return part;
}

export function updatePart(id: string, patch: Partial<ImportedPart>) {
  writeMeta(listParts().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export async function deletePart(id: string) {
  await tx("readwrite", (s) => s.delete(id));
  writeMeta(listParts().filter((p) => p.id !== id));
}

export async function partUrl(id: string): Promise<string | null> {
  const blob = await tx<Blob | undefined>("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
  return blob ? URL.createObjectURL(blob) : null;
}

/** Per-axis scale that fits a model's bounding box exactly onto a target size. */
export function fitScale(size: [number, number, number], target: [number, number, number]): [number, number, number] {
  return size.map((s, i) => (s > 1e-6 ? target[i]! / s : 1)) as [number, number, number];
}
