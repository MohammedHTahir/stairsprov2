import { Suspense, useMemo } from "react";
import { ImportedModel } from "@/components/ImportedModel";
import type { ImportedPart } from "@/lib/imports";
import * as THREE from "three";
import {
  GLASS, mountingPoints, STRUCTURES, TREADS,
  type Finishes, type Mounting, type StairParams, type Structure,
} from "@/lib/stairs";

export function StairModel({
  params,
  finishes,
  structure,
  mounting,
  imported,
}: {
  params: StairParams;
  finishes: Finishes;
  structure: Structure;
  mounting: Mounting;
  imported?: { url: string; part: ImportedPart } | undefined;
}) {
  const { steps, height, width, going } = params;
  const riser = height / steps;
  const run = steps * going;
  const tread = TREADS[finishes.tread];
  const glass = GLASS[finishes.glass];
  const metal = STRUCTURES[finishes.structure];
  const thick = finishes.tread === "concrete" ? 0.09 : 0.06;
  const angle = Math.atan2(height - riser, run);
  const length = Math.hypot(run, height - riser) + 0.3;
  const wallZ = -width / 2 - mounting.gap;
  const full = imported?.part.mode === "full";
  const anchors = full ? [] : mountingPoints(params, structure, mounting.wall);

  const glassGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, riser);
    for (let i = 0; i < steps; i++) {
      s.lineTo(i * going, (i + 1) * riser);
      s.lineTo((i + 1) * going, (i + 1) * riser);
    }
    s.lineTo(run, height + 0.95);
    s.lineTo(0, riser + 0.95);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false });
  }, [steps, going, riser, run, height]);

  const metalMat = (
    <meshStandardMaterial color={metal.color} metalness={metal.metalness} roughness={metal.roughness} />
  );
  const midY = (height + riser) / 2;
  const stringerZ = structure === "mono" ? 0 : 0;

  return (
    <group position={[-run / 2, 0, 0]}>
      {imported && (
        <Suspense fallback={null}>
          <ImportedModel url={imported.url} part={imported.part} params={params} finishes={finishes} thick={thick} />
        </Suspense>
      )}
      {!imported && Array.from({ length: steps }, (_, i) => (
        <mesh key={i} position={[i * going + going / 2, (i + 1) * riser - thick / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[going + 0.03, thick, width]} />
          <meshStandardMaterial color={tread.color} roughness={tread.roughness} />
        </mesh>
      ))}
      {!full && structure === "mono" && (
        <mesh position={[run / 2, midY - 0.2, stringerZ]} rotation={[0, 0, angle]} castShadow>
          <boxGeometry args={[length, 0.22, 0.14]} />
          {metalMat}
        </mesh>
      )}
      {!full && structure === "twin" &&
        [-1, 1].map((side) => (
          <mesh key={side} position={[run / 2, midY - 0.08, side * (width / 2 + 0.01)]} rotation={[0, 0, angle]} castShadow>
            <boxGeometry args={[length, 0.3, 0.012]} />
            {metalMat}
          </mesh>
        ))}

      {/* Wall plane the stair is mounted to */}
      {mounting.wall && mounting.showWall && (
        <mesh position={[run / 2, (height + 0.4) / 2, wallZ - 0.006]} receiveShadow>
          <boxGeometry args={[run + 1.6, height + 0.4, 0.012]} />
          <meshStandardMaterial color="#ece6dc" roughness={0.95} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      )}

      {/* Fixing hardware */}
      {anchors.map((a, i) => {
        if (a.kind === "wall") {
          const cant = structure === "cantilever";
          // gap between tread back edge and wall face
          const armLen = mounting.gap + (cant ? 0.12 : 0.06);
          return (
            <group key={i} position={[a.x, a.y - thick, wallZ]}>
              {/* wall plate */}
              <mesh position={[0, -0.02, 0.005]} castShadow>
                <boxGeometry args={[cant ? 0.2 : 0.12, cant ? 0.12 : 0.08, 0.01]} />
                {metalMat}
              </mesh>
              {/* bracket arm under the tread */}
              <mesh position={[0, -0.01, armLen / 2]} castShadow>
                <boxGeometry args={[cant ? 0.16 : 0.05, 0.02, armLen]} />
                {metalMat}
              </mesh>
              {/* bolt heads */}
              {Array.from({ length: a.bolts }, (_, b) => {
                const bx = a.bolts === 4 ? (b % 2 ? 1 : -1) * 0.07 : (b ? 1 : -1) * 0.04;
                const by = a.bolts === 4 ? (b < 2 ? 0.025 : -0.065) : -0.02;
                return (
                  <mesh key={b} position={[bx, by, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.009, 0.009, 0.006, 10]} />
                    <meshStandardMaterial color="#8d8d8d" metalness={0.9} roughness={0.3} />
                  </mesh>
                );
              })}
            </group>
          );
        }
        if (a.kind === "floor") {
          return (
            <group key={i} position={[going * 0.4, 0, structure === "twin" ? 0 : stringerZ]}>
              <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.012, structure === "twin" ? width + 0.06 : 0.24]} />
                {metalMat}
              </mesh>
              <mesh position={[0.03, 0.09, 0]} castShadow>
                <boxGeometry args={[0.16, 0.17, structure === "twin" ? width + 0.04 : 0.15]} />
                {metalMat}
              </mesh>
            </group>
          );
        }
        // top landing slab plate
        return (
          <group key={i} position={[a.x, a.y, 0]}>
            <mesh position={[0.25, -0.1, 0]} receiveShadow>
              <boxGeometry args={[0.5, 0.2, width + 0.4]} />
              <meshStandardMaterial color="#e4ddd2" roughness={0.9} transparent opacity={0.45} depthWrite={false} />
            </mesh>
            <mesh position={[0.005, -0.12, 0]} castShadow>
              <boxGeometry args={[0.012, 0.22, structure === "twin" ? width + 0.04 : 0.26]} />
              {metalMat}
            </mesh>
          </group>
        );
      })}

      {!full && <mesh geometry={glassGeo} position={[0, 0, width / 2 + 0.03]}>
        <meshPhysicalMaterial
          color={glass.color}
          transparent
          opacity={glass.opacity}
          roughness={glass.roughness}
          metalness={0.1}
          clearcoat={1}
          envMapIntensity={2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>}
    </group>
  );
}
