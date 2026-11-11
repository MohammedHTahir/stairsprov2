import { useMemo } from 'react';
import * as THREE from 'three';
import { buildFlights, SHAFT, VOID, type Flight, type StairSystem } from '@/lib/building';

export const BUILDING = { w: 12, d: 10, cx: 1, cz: 1 } as const;
const OAK = '#c09062'; const STEEL = '#1e1e1f'; const CORE = '#c0392b'; const SHELL = '#d9d3c9';

function shellMat(color: string, opacity: number) {
  return <meshStandardMaterial color={color} transparent opacity={opacity} depthWrite={opacity > 0.6} side={THREE.DoubleSide} roughness={0.9} />;
}

function Slab({ y, opacity, voided }: { y: number; opacity: number; voided: boolean }) {
  const geo = useMemo(() => {
    const { w, d, cx, cz } = BUILDING;
    const s = new THREE.Shape();
    s.moveTo(cx - w / 2, -(cz - d / 2)); s.lineTo(cx + w / 2, -(cz - d / 2)); s.lineTo(cx + w / 2, -(cz + d / 2)); s.lineTo(cx - w / 2, -(cz + d / 2)); s.closePath();
    if (voided) { const h = new THREE.Path(); h.moveTo(VOID.x0, -VOID.z0); h.lineTo(VOID.x0, -VOID.z1); h.lineTo(VOID.x1, -VOID.z1); h.lineTo(VOID.x1, -VOID.z0); h.closePath(); s.holes.push(h); }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); // shape y -> -z, extrusion -> +y
    return g;
  }, [voided]);
  return <mesh geometry={geo} position={[0, y - 0.25, 0]} receiveShadow>{shellMat(SHELL, opacity)}</mesh>;
}

function FlightModel({ f, system }: { f: Flight; system: StairSystem }) {
  const run = f.treads * f.going;
  const angle = Math.atan2(f.rise - f.riser, run - f.going);
  const saw = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0, 0);
    for (let i = 0; i < f.treads; i++) { s.lineTo(i * f.going, (i + 1) * f.riser); s.lineTo((i + 1) * f.going, (i + 1) * f.riser); }
    s.lineTo(run, f.treads * f.riser - 0.22); s.lineTo(0.22, -0.02); s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false });
  }, [f.treads, f.going, f.riser, run]);
  return (
    <group position={[f.x, f.y, f.z]} rotation={[0, f.dir === 1 ? 0 : Math.PI, 0]}>
      {Array.from({ length: f.treads }, (_, i) => (
        <mesh key={i} position={[(i + 0.5) * f.going, (i + 1) * f.riser - 0.03, 0]} castShadow>
          <boxGeometry args={[f.going + 0.02, 0.06, SHAFT.width]} />
          <meshStandardMaterial color={OAK} roughness={0.55} />
        </mesh>
      ))}
      {system === 'spine' ? (
        <mesh position={[run / 2, (f.riser + f.rise - f.riser) / 2 - 0.2, 0]} rotation={[0, 0, angle]} castShadow>
          <boxGeometry args={[Math.hypot(run, f.rise) + 0.2, 0.24, 0.2]} />
          <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
        </mesh>
      ) : (
        [-1, 1].map(side => (
          <mesh key={side} geometry={saw} position={[0, -0.06, side * (SHAFT.width / 2 - 0.08)]} castShadow>
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} />
          </mesh>
        ))
      )}
    </group>
  );
}

export function BuildingModel({ floors, floorHeight, system, opacity, multi }: { floors: number; floorHeight: number; system: StairSystem; opacity: number; multi: boolean }) {
  const levels = multi ? floors : 2;
  const flights = useMemo(() => buildFlights(levels, floorHeight), [levels, floorHeight]);
  const top = (levels - 1) * floorHeight; const height = multi ? top + floorHeight * 0.4 : top;
  const { w, d, cx, cz } = BUILDING;
  return (
    <group>
      {flights.map((f, i) => <FlightModel key={i} f={f} system={system} />)}
      {/* mid landings */}
      {flights.filter(f => f.dir === 1).map((f, i) => (
        <mesh key={`l${i}`} position={[VOID.x1 - SHAFT.landing / 2, f.y + f.rise - 0.04, (VOID.z0 + VOID.z1) / 2]} castShadow>
          <boxGeometry args={[SHAFT.landing, 0.08, VOID.z1 - VOID.z0]} />
          <meshStandardMaterial color={OAK} roughness={0.55} />
        </mesh>
      ))}
      <Slab y={0.25} opacity={Math.max(opacity, 0.35)} voided={false} />
      {multi && Array.from({ length: levels - 1 }, (_, i) => <Slab key={i} y={(i + 1) * floorHeight} opacity={opacity} voided />)}
      {multi && (
        <>
          <mesh position={[4.6, height / 2, -2.5]}><boxGeometry args={[2.4, height, 2.4]} />{shellMat(CORE, Math.min(1, opacity + 0.1))}</mesh>
          {[cz - d / 2, cz + d / 2].map((z, i) => (
            <mesh key={`w${i}`} position={[cx, height / 2, z]}><boxGeometry args={[w, height, 0.2]} />{shellMat(SHELL, opacity)}</mesh>
          ))}
          {[cx - w / 2, cx + w / 2].map((x, i) => (
            <mesh key={`s${i}`} position={[x, height / 2, cz]}><boxGeometry args={[0.2, height, d]} />{shellMat(SHELL, opacity)}</mesh>
          ))}
        </>
      )}
    </group>
  );
}
