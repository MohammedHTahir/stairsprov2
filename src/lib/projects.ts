import { DEFAULT_PLACEMENT, DESIGNS, type Calibration, type Finishes, type Mounting, type Placement, type StairParams } from "./stairs";

export type Project = {
  id: string;
  name: string;
  client: string;
  createdAt: number;
  updatedAt: number;
  designId: string;
  params: StairParams;
  placement: Placement;
  finishes: Finishes;
  mounting?: Mounting | undefined;
  calibration?: Calibration | undefined;
  /** Imported Blender/CAD model replacing the catalog geometry. */
  partId?: string | undefined;
  photo?: string | undefined;
  render?: string | undefined;
};

const KEY = "stairstudio.projects.v1";

export function listProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Project[];
  } catch {
    return [];
  }
}

export const getProject = (id: string) => listProjects().find((p) => p.id === id);

export function saveProject(p: Project): boolean {
  const all = listProjects().filter((x) => x.id !== p.id);
  all.unshift({ ...p, updatedAt: Date.now() });
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function deleteProject(id: string) {
  localStorage.setItem(KEY, JSON.stringify(listProjects().filter((p) => p.id !== id)));
}

export function createProject(name: string, client: string): Project {
  const d = DESIGNS[0]!;
  const p: Project = {
    id: crypto.randomUUID(),
    name: name || "Untitled staircase",
    client,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    designId: d.id,
    params: { ...d.params },
    placement: { ...DEFAULT_PLACEMENT },
    finishes: { ...d.finishes },
  };
  saveProject(p);
  return p;
}
