"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  Environment,
  Lightformer,
  Icosahedron,
  Instances,
  Instance,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const ACCENT = "#2a41e8";
const ACCENT_SOFT = "#5566f2";
const BRAIN_URL = "/models/brain.glb"; // модель мозга с её родными текстурами/материалом

/** Мозг с РОДНЫМ материалом модели (текстура, нормали) — центр сцены, без своих стилей. */
function HeadModel() {
  const { scene } = useGLTF(BRAIN_URL);
  const model = useMemo(() => {
    const root = scene.clone(true);
    // Материал реалистичного мозга: розовато-телесный, матово-влажная ткань.
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: "#c0837a",
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.6,
      sheen: 0.5,
      sheenColor: new THREE.Color("#e7a79c"),
      sheenRoughness: 0.8,
      envMapIntensity: 0.4,
    });
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals(); // в OBJ нормалей нет
      m.material = brainMat;
    });
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.2 / (size.y || 1); // масштаб по высоте под центр сцены
    root.scale.setScalar(s);
    root.position.set(-center.x * s, -center.y * s, -center.z * s); // центрируем
    return root;
  }, [scene]);
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={model} />
    </group>
  );
}

interface Geom {
  nodes: THREE.Vector3[];
  edges: [number, number][];
  linePositions: Float32Array;
}

function buildGeometry(count: number, radius: number): Geom {
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = i * golden;
    const noise = 1 + Math.sin(i * 1.7) * 0.07 + Math.cos(i * 0.9) * 0.05;
    nodes.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(
        radius * noise,
      ),
    );
  }

  const edges: [number, number][] = [];
  const threshold = radius * 0.6;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < threshold) {
        edges.push([i, j]);
        if (edges.length > 160) break;
      }
    }
    if (edges.length > 160) break;
  }

  const linePositions = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], k) => {
    linePositions.set([nodes[a].x, nodes[a].y, nodes[a].z], k * 6);
    linePositions.set([nodes[b].x, nodes[b].y, nodes[b].z], k * 6 + 3);
  });

  return { nodes, edges, linePositions };
}

function Pulses({ geom }: { geom: Geom }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const state = useRef(
    Array.from({ length: 8 }, () => ({
      edge: Math.floor(Math.random() * geom.edges.length),
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.5,
    })),
  );

  useFrame((_, dt) => {
    state.current.forEach((p, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      p.t += p.speed * dt;
      if (p.t >= 1) {
        p.t = 0;
        p.edge = Math.floor(Math.random() * geom.edges.length);
        p.speed = 0.3 + Math.random() * 0.5;
      }
      const [a, b] = geom.edges[p.edge] ?? [0, 1];
      mesh.position.lerpVectors(geom.nodes[a], geom.nodes[b], p.t);
    });
  });

  return (
    <>
      {state.current.map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshBasicMaterial color="#9fb0ff" toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function NeuralModel({ reduce }: { reduce: boolean }) {
  const spin = useRef<THREE.Group>(null);
  const point = useRef<THREE.Group>(null);
  const geom = useMemo(() => buildGeometry(72, 1.5), []);

  useFrame((state, dt) => {
    if (reduce) return;
    if (spin.current) spin.current.rotation.y += dt * 0.12;
    if (point.current) {
      point.current.rotation.y = THREE.MathUtils.lerp(point.current.rotation.y, state.pointer.x * 0.4, 0.05);
      point.current.rotation.x = THREE.MathUtils.lerp(point.current.rotation.x, -state.pointer.y * 0.3, 0.05);
    }
  });

  return (
    <Float speed={reduce ? 0 : 1.1} rotationIntensity={reduce ? 0 : 0.25} floatIntensity={reduce ? 0 : 0.6}>
      <group ref={point}>
        <group ref={spin}>
          <HeadModel />

          <Icosahedron args={[1.52, 1]}>
            <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.12} />
          </Icosahedron>

          <Instances limit={geom.nodes.length} range={geom.nodes.length}>
            <sphereGeometry args={[0.026, 12, 12]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} roughness={0.4} />
            {geom.nodes.map((n, i) => (
              <Instance key={i} position={[n.x, n.y, n.z]} />
            ))}
          </Instances>

          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[geom.linePositions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={ACCENT} transparent opacity={0.2} toneMapped={false} />
          </lineSegments>

          <Pulses geom={geom} />
        </group>
      </group>
    </Float>
  );
}

useGLTF.preload(BRAIN_URL);

export default function NeuralBrainScene({ reduce = false }: { reduce?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, -2, -4]} intensity={0.5} color={ACCENT_SOFT} />

      <Suspense fallback={null}>
        <NeuralModel reduce={reduce} />
      </Suspense>

      <ContactShadows position={[0, -1.9, 0]} opacity={0.22} blur={2.8} scale={9} far={4} color="#0a1124" />

      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 3, 2]} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1} position={[-3, 1, 3]} scale={[3, 3, 1]} color="#dfe4ff" />
        <Lightformer form="ring" intensity={1.2} position={[3, -1, 2]} scale={[2, 2, 1]} color="#aab4ff" />
      </Environment>

      {!reduce && (
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.6} luminanceSmoothing={0.2} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
