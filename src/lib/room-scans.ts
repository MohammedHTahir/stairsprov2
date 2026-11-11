export type RoomScan = { id: string; name: string; createdAt: number; bytes: number };
type StoredScan = RoomScan & { file: Blob };
const DB_NAME = "stairstudio.room-scans.v1";
const STORE = "scans";

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Room scans could not be opened on this device."));
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(new Error("Could not save the scan. Check available device storage.")); };
  });
}

/** Self-contained GLB only: external textures/buffers cannot survive a single-file import. */
export async function validateRoomScan(file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith(".glb")) throw new Error("Import a .glb room scan, not a photo. Capture and export the room in a scanning app first.");
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength < 20) throw new Error("This file is not a valid GLB scan.");
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== buffer.byteLength) throw new Error("This file is not a valid GLB 2.0 scan.");
  const jsonSize = view.getUint32(12, true);
  if (view.getUint32(16, true) !== 0x4e4f534a || jsonSize > buffer.byteLength - 20) throw new Error("The scan's model data is damaged.");
  let data: { buffers?: { uri?: string }[]; images?: { uri?: string }[] };
  try { data = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonSize))); }
  catch { throw new Error("The scan's model data is damaged."); }
  if ([...(data.buffers ?? []), ...(data.images ?? [])].some((item) => item.uri && !item.uri.startsWith("data:"))) throw new Error("Export a self-contained GLB with textures embedded. This scan references separate files.");
}

export async function saveRoomScan(file: File): Promise<RoomScan> {
  const scan: RoomScan = { id: crypto.randomUUID(), name: file.name.replace(/\.glb$/i, ""), createdAt: Date.now(), bytes: file.size };
  await transaction("readwrite", (store) => store.put({ ...scan, file }));
  return scan;
}
export async function listRoomScans(): Promise<RoomScan[]> {
  const scans = await transaction<StoredScan[]>("readonly", (store) => store.getAll());
  return scans.map(({ file: _file, ...scan }) => scan).sort((a, b) => b.createdAt - a.createdAt);
}
export async function getRoomScanFile(id: string): Promise<Blob | undefined> {
  const scan = await transaction<StoredScan | undefined>("readonly", (store) => store.get(id));
  return scan?.file;
}
export async function deleteRoomScan(id: string): Promise<void> {
  await transaction("readwrite", (store) => store.delete(id));
}

/** Translation only; never stretch a measured scan to fit an arbitrary room. */
export function roomScanPlacement(min: [number, number, number], max: [number, number, number]) {
  return {
    position: [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2] as [number, number, number],
    dimensions: max.map((v, i) => v - (min[i] ?? 0)) as [number, number, number],
  };
}