"use client";

import { useMemo, useRef, Suspense, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useIsMobile, useOnScreen } from "@/lib/use-device";
import { ANNO_ANCHORS } from "@/lib/anatomyAnchors";

const MODEL_URL = "/models/body.glb";
const NERVE_URL = "/models/nervous-system.glb";
const ACCENT = "#5566f2";
const CNS_COLOR = "#bfe0ff"; // ЦНС — мозг + спинной мозг (светлее, как плотная ткань на рентгене)
const PNS_COLOR = "#3f7fe0"; // ПНС — нервы (рентгеновский синий, как тело)
const XRAY_RIM = "#cfe6ff"; // краевое свечение (как у тела)
const MODEL_X = -0.5;
const TURN_Y = 0;
const SHOW_BODY = false; // силуэт тела (другая поза, чем у нервной модели) — выключен
const NERVE_TURN_Y = -Math.PI / 2; // T-поза модели смотрит вдоль X — развернуть лицом к камере

export interface StageDef {
  yFrac: number;
  zoom: number;
}
interface Focus {
  center: THREE.Vector3;
  dist: number;
}
/** Body bounding box in world space — anatomical coordinate frame. */
interface BodyBox {
  minY: number;
  H: number;
  W: number;
  cx: number;
  cz: number;
}

/* --- рентген-силуэт тела (фон/контекст) --- */
const vertexShader = `
  varying vec3 vN; varying vec3 vV;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const fragmentShader = `
  uniform vec3 uColor; uniform vec3 uRim; uniform float uPower; uniform float uIntensity; uniform float uBase;
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
    vec3 col = mix(uColor, uRim, f) * (f * uIntensity + uBase);
    gl_FragColor = vec4(col, f * uIntensity + uBase);
  }`;

function makeXray() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color("#3f7fe0") },
      uRim: { value: new THREE.Color("#cfe6ff") },
      uPower: { value: 2.6 },
      uIntensity: { value: 0.3 },
      uBase: { value: 0.01 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/* --- материал нервной системы: ЦНС красным, ПНС синим (разделение по позиции) --- */
const nerveVert = `
  varying vec3 vPos; varying vec3 vN; varying vec3 vV;
  void main(){
    vPos = position;                 // нормализованное пространство модели (-1..1 по Y)
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const nerveFrag = `
  uniform vec3 uCNS; uniform vec3 uPNS; uniform vec3 uRim;
  uniform float uHeadY;   // порог «мозг» по высоте (norm Y)
  uniform float uAxis;    // радиус центрального спинного мозга
  uniform float uCordTop; uniform float uCordBot; // диапазон спинного мозга по высоте
  uniform float uPower; uniform float uIntensity; uniform float uBase;
  varying vec3 vPos; varying vec3 vN; varying vec3 vV;
  void main(){
    float ny = vPos.y * 0.5 + 0.5;                 // 0..1
    float axis = length(vec2(vPos.x, vPos.z));     // расстояние от вертикальной оси
    float head = smoothstep(uHeadY - 0.04, uHeadY + 0.02, ny);
    float cord = smoothstep(uAxis * 1.7, uAxis * 0.7, axis)
               * smoothstep(uCordBot - 0.03, uCordBot + 0.03, ny)
               * (1.0 - smoothstep(uCordTop - 0.02, uCordTop + 0.04, ny));
    float cns = clamp(max(head, cord), 0.0, 1.0);
    vec3 base = mix(uPNS, uCNS, cns);
    // рентгеновский френель-силуэт (как у тела, но плотнее)
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
    float a = f * uIntensity + uBase;
    vec3 col = mix(base, uRim, f) * a;
    gl_FragColor = vec4(col, a);
  }`;

function makeNerveMat() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uCNS: { value: new THREE.Color(CNS_COLOR) },
      uPNS: { value: new THREE.Color(PNS_COLOR) },
      uRim: { value: new THREE.Color(XRAY_RIM) },
      uHeadY: { value: 0.84 },
      uAxis: { value: 0.05 },
      uCordTop: { value: 0.86 },
      uCordBot: { value: 0.44 },
      uPower: { value: 2.4 },
      uIntensity: { value: 1.15 },
      uBase: { value: 0.05 },
    },
    vertexShader: nerveVert,
    fragmentShader: nerveFrag,
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

/**
 * Извлекает реальные нервные пути прямо из геометрии модели: пускает «обходы»
 * по облаку вершин с инерцией направления, чтобы трассы шли вдоль самих нервов,
 * а не по приблизительным кривым. Точки — в системе координат outer (= система
 * импульсов), так что сигналы идут строго внутри модели.
 */
function buildFlowCurves(source: THREE.Object3D, walks: number): THREE.CatmullRomCurve3[] {
  source.updateMatrixWorld(true);
  const pts: THREE.Vector3[] = [];
  const v = new THREE.Vector3();
  source.traverse((o) => {
    const m = o as THREE.Mesh;
    const geom = m.geometry as THREE.BufferGeometry | undefined;
    if (m.isMesh && geom?.attributes.position) {
      const pos = geom.attributes.position;
      const stride = Math.max(1, Math.floor(pos.count / 6000)); // ограничиваем выборку
      for (let i = 0; i < pos.count; i += stride) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        pts.push(v.clone());
      }
    }
  });
  if (pts.length < 80) return [];

  const box = new THREE.Box3().setFromPoints(pts);
  const center = box.getCenter(new THREE.Vector3());
  const diag = box.getSize(new THREE.Vector3()).length();
  const cell = diag * 0.013; // радиус соседства
  const inv = 1 / cell;
  const maxJump2 = (cell * 2) ** 2;

  // равномерный пространственный хеш для быстрого поиска соседей
  const grid = new Map<string, number[]>();
  const keyOf = (x: number, y: number, z: number) =>
    `${Math.floor(x * inv)}|${Math.floor(y * inv)}|${Math.floor(z * inv)}`;
  pts.forEach((p, idx) => {
    const k = keyOf(p.x, p.y, p.z);
    const arr = grid.get(k);
    if (arr) arr.push(idx);
    else grid.set(k, [idx]);
  });
  const near = (p: THREE.Vector3, out: number[]) => {
    out.length = 0;
    const gx = Math.floor(p.x * inv), gy = Math.floor(p.y * inv), gz = Math.floor(p.z * inv);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const arr = grid.get(`${gx + dx}|${gy + dy}|${gz + dz}`);
          if (arr) for (const i of arr) out.push(i);
        }
  };

  // затравка из крайних точек (кончики пальцев, стопы, макушка) в случайном направлении
  const seedFrom = (u: THREE.Vector3) => {
    let best = pts[0], bestDot = -Infinity;
    for (const p of pts) {
      const d = (p.x - center.x) * u.x + (p.y - center.y) * u.y + (p.z - center.z) * u.z;
      if (d > bestDot) { bestDot = d; best = p; }
    }
    return best;
  };

  const curves: THREE.CatmullRomCurve3[] = [];
  const cand: number[] = [];
  const d = new THREE.Vector3();
  for (let w = 0; w < walks; w++) {
    const u = new THREE.Vector3(
      Math.random() - 0.5,
      (Math.random() - 0.5) * 1.6, // тянем к макушке/стопам
      Math.random() - 0.5,
    ).normalize();
    let cur = seedFrom(u).clone();
    const dir = center.clone().sub(cur).normalize(); // стартуем внутрь тела
    const path: THREE.Vector3[] = [cur.clone()];
    const visited = new Set<number>();

    for (let step = 0; step < 140; step++) {
      near(cur, cand);
      let best = -1, bestScore = -Infinity;
      for (const idx of cand) {
        if (visited.has(idx)) continue;
        const np = pts[idx];
        const dist2 = np.distanceToSquared(cur);
        if (dist2 < 1e-8 || dist2 > maxJump2) continue;
        d.copy(np).sub(cur).normalize();
        const align = d.dot(dir);
        if (align < 0.1) continue; // не разворачиваемся назад — идём вдоль нерва
        const score = align - Math.sqrt(dist2) * inv * 0.12;
        if (score > bestScore) { bestScore = score; best = idx; }
      }
      if (best < 0) break;
      visited.add(best);
      const np = pts[best];
      d.copy(np).sub(cur).normalize();
      dir.lerp(d, 0.5).normalize(); // инерция направления
      cur = np.clone();
      path.push(cur.clone());
    }
    if (path.length >= 10) curves.push(new THREE.CatmullRomCurve3(path));
  }
  return curves;
}

/** Запасные пути по габаритам тела, если из геометрии не удалось извлечь трассы. */
function handCurves(bb: BodyBox): THREE.CatmullRomCurve3[] {
  const H = bb.H, cx = bb.cx, cz = bb.cz, cy = bb.minY + H / 2;
  const P = (x: number, y: number, z = 0.02) =>
    new THREE.Vector3(cx + x * H, cy + y * H, cz + z * H);
  const cm = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts);
  return [
    cm([P(0, 0.46), P(0, 0.34), P(0, 0.18), P(0, 0.02), P(0, -0.06)]),
    cm([P(-0.1, 0.335), P(-0.28, 0.335), P(-0.42, 0.335), P(-0.5, 0.33)]),
    cm([P(0.1, 0.335), P(0.28, 0.335), P(0.42, 0.335), P(0.5, 0.33)]),
    cm([P(-0.06, -0.02), P(-0.08, -0.22), P(-0.085, -0.4), P(-0.09, -0.48)]),
    cm([P(0.06, -0.02), P(0.08, -0.22), P(0.085, -0.4), P(0.09, -0.48)]),
  ];
}

/**
 * Нервная модель + бегущие импульсы. Трассы импульсов берутся прямо из геометрии
 * модели, поэтому сигналы идут точно внутри неё.
 */
function NervousSystem({
  bb,
  progress,
  reduce,
}: {
  bb: BodyBox;
  progress: RefObject<number>;
  reduce: boolean;
}) {
  const { scene } = useGLTF(NERVE_URL);

  const { object, curves } = useMemo(() => {
    const root = scene.clone(true);
    const turn = new THREE.Group();
    turn.rotation.y = NERVE_TURN_Y;
    turn.add(root);

    const box = new THREE.Box3().setFromObject(turn);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    turn.position.set(-center.x, -center.y, -center.z); // центр модели -> локальный 0

    const outer = new THREE.Group();
    outer.add(turn);
    outer.scale.setScalar(bb.H / (size.y || 1)); // по высоте тела
    outer.position.set(bb.cx, bb.minY + bb.H / 2, bb.cz);

    const mat = makeNerveMat();
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.frustumCulled = false;
        m.material = mat;
      }
    });

    const extracted = buildFlowCurves(outer, 18);
    const curves = extracted.length >= 4 ? extracted : handCurves(bb);
    return { object: outer, curves };
  }, [scene, bb]);

  return (
    <>
      <primitive object={object} />
      <NerveImpulses curves={curves} progress={progress} reduce={reduce} />
    </>
  );
}

const SEG = 16; // число точек в линии-импульсе (голова + затухающий хвост)

/** Бегущие импульсы — тонкие светящиеся линии-стримеры, скользящие по нервам. */
function NerveImpulses({
  curves,
  progress,
  reduce,
}: {
  curves: THREE.CatmullRomCurve3[];
  progress: RefObject<number>;
  reduce: boolean;
}) {
  const n = Math.max(1, curves.length);
  const count = Math.min(n * 2, 30);

  // отдельная линия-стример на каждый импульс; цвет затухает от головы к хвосту
  const { geoms, lines } = useMemo(() => {
    const head = new THREE.Color("#eaf4ff");
    const tail = new THREE.Color("#4f8fde");
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
    });
    const geoms: THREE.BufferGeometry[] = [];
    const lines: THREE.Line[] = [];
    for (let i = 0; i < count; i++) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SEG * 3), 3));
      const col = new Float32Array(SEG * 3);
      for (let j = 0; j < SEG; j++) {
        const k = j / (SEG - 1);
        const c = head.clone().lerp(tail, k).multiplyScalar((1 - k) ** 1.4); // ярко -> в ноль
        col[j * 3] = c.r;
        col[j * 3 + 1] = c.g;
        col[j * 3 + 2] = c.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const line = new THREE.Line(g, material);
      line.renderOrder = 20;
      line.frustumCulled = false;
      geoms.push(g);
      lines.push(line);
    }
    return { geoms, lines };
  }, [count]);

  const pulses = useRef(
    Array.from({ length: count }, (_, i) => ({
      path: i % n,
      t: (i * 0.137) % 1,
      speed: 0.07 + (i % 5) * 0.025, // медленнее — это «сигналы», а не искры
      gap: 0.0035 + (i % 3) * 0.0012, // длина стримера (в долях кривой)
    })),
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const p = reduce ? 0 : progress.current;
    const boost = 1 + p * 2.6;
    const step = Math.min(dt, 0.05);
    pulses.current.forEach((pl, i) => {
      const g = geoms[i];
      const pos = g.attributes.position as THREE.BufferAttribute;
      const curve = curves[pl.path % curves.length];
      if (!reduce) {
        pl.t += pl.speed * step * boost;
        if (pl.t >= 1) pl.t -= 1;
      }
      for (let j = 0; j < SEG; j++) {
        let tt = pl.t - j * pl.gap;
        if (tt < 0) tt = 0;
        else if (tt > 0.9999) tt = 0.9999;
        curve.getPointAt(tt, tmp);
        pos.setXYZ(j, tmp.x, tmp.y, tmp.z);
      }
      pos.needsUpdate = true;
    });
  });

  return (
    <group renderOrder={20}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

function Anatomy({
  stages,
  progress,
  reduce,
  annoOut,
}: {
  stages: StageDef[];
  progress: RefObject<number>;
  reduce: boolean;
  annoOut?: RefObject<number[]>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const { group, focus, bb } = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const scale = 2.3 / (Math.max(size.x, size.y, size.z) || 1);
    root.scale.setScalar(scale);
    root.position.set(-c.x * scale, -c.y * scale, -c.z * scale);

    const turn = new THREE.Group();
    turn.rotation.y = TURN_Y;
    turn.add(root);
    const group = new THREE.Group();
    group.add(turn);
    group.position.x = MODEL_X;
    group.updateMatrixWorld(true);

    const mat = makeXray();
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.frustumCulled = false;
        m.material = mat;
      }
    });

    const wb = new THREE.Box3().setFromObject(group);
    const wsize = wb.getSize(new THREE.Vector3());
    const cx = (wb.min.x + wb.max.x) / 2;
    const cz = (wb.min.z + wb.max.z) / 2;
    const fovRad = THREE.MathUtils.degToRad(38 / 2);
    const focus: Focus[] = stages.map((s) => {
      const cy = wb.min.y + s.yFrac * wsize.y;
      const visibleH = wsize.y / s.zoom;
      const dist = THREE.MathUtils.clamp((visibleH / (2 * Math.tan(fovRad))) * 1.05, 0.55, 6);
      return { center: new THREE.Vector3(cx, cy, cz), dist };
    });
    const bb: BodyBox = { minY: wb.min.y, H: wsize.y, W: wsize.x, cx, cz };

    return { group, focus, bb };
  }, [scene, stages]);

  const groupRef = useRef<THREE.Group>(null);
  const smooth = useRef(0);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camTgt = useMemo(() => new THREE.Vector3(), []);
  const annoV = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const n = stages.length - 1;
    const p = reduce ? 0 : progress.current;
    const target = p * n;
    smooth.current += (target - smooth.current) * 0.08;
    const pCur = smooth.current;
    const i0 = Math.min(n, Math.max(0, Math.floor(pCur)));
    const i1 = Math.min(n, i0 + 1);
    let f = pCur - i0;
    f = f * f * (3 - 2 * f);
    const c0 = focus[i0], c1 = focus[i1];
    camTgt.lerpVectors(c0.center, c1.center, f);
    const dist = c0.dist + (c1.dist - c0.dist) * f;
    camPos.set(camTgt.x, camTgt.y + 0.05, camTgt.z + dist);
    camera.position.lerp(camPos, 0.12);
    camera.lookAt(camTgt);

    if (groupRef.current) {
      groupRef.current.rotation.y =
        0.18 * (pCur / n) - 0.06 + (reduce ? 0 : 0.04 * Math.sin(state.clock.elapsedTime * 0.4));
    }

    // Проекция якорей тела РЕАЛЬНОЙ камерой → экранные % для DOM-оверлея.
    if (annoOut && groupRef.current) {
      camera.updateMatrixWorld();
      groupRef.current.updateMatrixWorld();
      const m = groupRef.current.matrixWorld;
      const out = annoOut.current ?? (annoOut.current = []);
      for (let i = 0; i < ANNO_ANCHORS.length; i++) {
        const a = ANNO_ANCHORS[i];
        annoV
          .set(bb.cx + a.icon.bx * bb.H, bb.minY + a.icon.by * bb.H, bb.cz)
          .applyMatrix4(m)
          .project(camera);
        out[i * 4] = (annoV.x * 0.5 + 0.5) * 100;
        out[i * 4 + 1] = (-annoV.y * 0.5 + 0.5) * 100;
        annoV
          .set(bb.cx + a.node.bx * bb.H, bb.minY + a.node.by * bb.H, bb.cz)
          .applyMatrix4(m)
          .project(camera);
        out[i * 4 + 2] = (annoV.x * 0.5 + 0.5) * 100;
        out[i * 4 + 3] = (-annoV.y * 0.5 + 0.5) * 100;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {SHOW_BODY && <primitive object={group} />}
      <NervousSystem bb={bb} progress={progress} reduce={reduce} />
    </group>
  );
}
useGLTF.preload(MODEL_URL);
useGLTF.preload(NERVE_URL);

export default function AnatomyScene({
  stages,
  progress,
  reduce = false,
  annoOut,
}: {
  stages: StageDef[];
  progress: RefObject<number>;
  reduce?: boolean;
  annoOut?: RefObject<number[]>;
}) {
  const mobile = useIsMobile();
  const wrap = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(wrap); // пауза рендера, когда секция за экраном

  return (
    <div ref={wrap} style={{ width: "100%", height: "100%" }}>
      <Canvas
        frameloop={onScreen ? "always" : "never"}
        dpr={mobile ? [1, 1.25] : [1, 1.6]}
        camera={{ position: [MODEL_X, 0.2, 3.6], fov: 38, near: 0.05, far: 60 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <hemisphereLight args={["#eaf1ff", "#0a1020", 1.2]} />
        <directionalLight position={[2.5, 3.5, 4]} intensity={1.6} />
        <directionalLight position={[-3.5, 1.5, -2.5]} intensity={1} color={ACCENT} />

        <Suspense fallback={null}>
          <Anatomy stages={stages} progress={progress} reduce={reduce} annoOut={annoOut} />
        </Suspense>

        <Environment resolution={mobile ? 64 : 128}>
          <Lightformer form="rect" intensity={1.4} position={[0, 3, 3]} scale={[6, 3, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={0.9} position={[-4, 0, 2]} scale={[3, 4, 1]} color="#aab4ff" />
        </Environment>

        {/* bloom — самый тяжёлый проход на мобилке, выключаем */}
        {!reduce && !mobile && (
          <EffectComposer>
            <Bloom intensity={0.3} luminanceThreshold={0.65} luminanceSmoothing={0.2} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
