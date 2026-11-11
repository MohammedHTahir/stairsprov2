// Multi-photo capture session stored in IndexedDB so large photo sets survive reloads.
export type CapturePhoto = { id: string; blob: Blob; createdAt: number };

export const MIN_PHOTOS = 12;
export const TARGET_PHOTOS = 24;

export function captureProgress(count: number): { ready: boolean; label: string } {
  if (count < MIN_PHOTOS) return { ready: false, label: `${MIN_PHOTOS - count} more needed` };
  if (count < TARGET_PHOTOS) return { ready: true, label: "Enough — more improves detail" };
  return { ready: true, label: "Great coverage" };
}

const DB = "stairstudio-capture";
const STORE = "photos";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => { resolve(req.result); db.close(); };
    t.onerror = () => { reject(t.error); db.close(); };
  });
}

export async function listPhotos(): Promise<CapturePhoto[]> {
  const all = await tx<CapturePhoto[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => a.createdAt - b.createdAt);
}
export async function addPhoto(blob: Blob): Promise<CapturePhoto> {
  const photo = { id: crypto.randomUUID(), blob, createdAt: Date.now() };
  await tx("readwrite", (s) => s.put(photo));
  return photo;
}
export const deletePhoto = (id: string) => tx("readwrite", (s) => s.delete(id));
export const clearPhotos = () => tx("readwrite", (s) => s.clear());
