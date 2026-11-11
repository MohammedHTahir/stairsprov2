import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { fitScale, type ImportedPart } from "@/lib/imports";
import { TREADS, type Finishes, type StairParams } from "@/lib/stairs";

function useNormalized(url: string, part: ImportedPart, finishes: Finishes) {
  const loaded = useLoader(part.ext === "obj" ? OBJLoader : GLTFLoader, url) as THREE.Group | { scene: THREE.Group };
  return useMemo(() => {
    const src = "scene" in loaded ? loaded.scene : loaded;
    const root = new THREE.Group();
    const inner = src.clone(true);
    if (part.zUp) inner.rotation.x = -Math.PI / 2;
    root.add(inner);
    root.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(root);
    let size = box.getSize(new THREE.Vector3());
    // Tread parts: the long horizontal side goes across the stair (z).
    if (part.mode === "tread" && size.x > size.z) {
      root.rotation.y = Math.PI / 2;
      root.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(root);
      size = box.getSize(new THREE.Vector3());
    }
    const wrap = new THREE.Group();
    root.position.sub(box.min); // min corner at origin
    wrap.add(root);
    const tread = TREADS[finishes.tread];
    wrap.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      // OBJ has no materials; give tread parts the selected finish.
      if (part.ext === "obj" || part.mode === "tread") {
        m.material = new THREE.MeshStandardMaterial({ color: tread.color, roughness: tread.roughness });
      }
    });
    return { wrap, size: [size.x, size.y, size.z] as [number, number, number] };
  }, [loaded, part.zUp, part.mode, part.ext, finishes.tread]);
}

/** Imported part laid out by the stair parameters. Rendered inside StairModel's local group. */
export function ImportedModel({
  url, part, params, finishes, thick,
}: {
  url: string;
  part: ImportedPart;
  params: StairParams;
  finishes: Finishes;
  thick: number;
}) {
  const { wrap, size } = useNormalized(url, part, finishes);
  const { steps, height, width, going } = params;
  const riser = height / steps;
  const copies = useMemo(() => Array.from({ length: steps }, (_, i) => (i === 0 ? wrap : wrap.clone(true))), [wrap, steps]);

  if (part.mode === "full") {
    const s = fitScale(size, [steps * going, height, width]);
    return <primitive object={wrap} position={[0, 0, -width / 2]} scale={s} />;
  }
  const s = fitScale(size, [going + 0.03, thick, width]);
  return (
    <>
      {copies.map((_, i) => (
        <primitive
          key={i}
          object={copies[i]!}
          position={[i * going - 0.015, (i + 1) * riser - thick, -width / 2]}
          scale={s}
        />
      ))}
    </>
  );
}
