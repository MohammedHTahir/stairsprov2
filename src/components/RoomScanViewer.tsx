import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, useBounds } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as THREE from "three";
import { roomScanPlacement } from "@/lib/room-scans";

function Reframe({ revision }: { revision: number }) {
  const bounds = useBounds();
  useEffect(() => { bounds.refresh().clip().fit(); }, [bounds, revision]);
  return null;
}

export default function RoomScanViewer({ url, revision, onReady, onError }: {
  url: string; revision: number;
  onReady: (dimensions: [number, number, number]) => void;
  onError: (message: string) => void;
}) {
  const [model, setModel] = useState<{ scene: THREE.Group; position: [number, number, number] } | null>(null);
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };
  useEffect(() => {
    let cancelled = false;
    let scene: THREE.Group | undefined;
    const draco = new DRACOLoader().setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader().setDRACOLoader(draco);
    setModel(null);
    loader.loadAsync(url).then((gltf) => {
      scene = gltf.scene;
      if (cancelled) return;
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene);
      if (box.isEmpty()) throw new Error("This scan contains no visible room geometry.");
      const result = roomScanPlacement(box.min.toArray(), box.max.toArray());
      setModel({ scene, position: result.position });
      callbacks.current.onReady(result.dimensions);
    }).catch(() => {
      if (!cancelled) callbacks.current.onError("This scan could not be displayed. Export a textured GLB mesh with embedded textures and try again.");
    });
    return () => {
      cancelled = true;
      draco.dispose();
      scene?.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) value.dispose(); });
          material.dispose();
        });
      });
    };
  }, [url]);

  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <ambientLight intensity={1.8} />
      <directionalLight position={[4, 8, 5]} intensity={2} />
      {model && <Bounds fit clip observe margin={1.2}>
        <group position={model.position}><primitive object={model.scene} /></group>
        <Reframe revision={revision} />
      </Bounds>}
      <OrbitControls makeDefault enableDamping minDistance={0.05} />
    </Canvas>
  );
}