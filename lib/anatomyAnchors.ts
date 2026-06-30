/**
 * Якоря аннотаций в системе координат фигуры (общие для DOM-оверлея и 3D-сцены):
 *  - bx: смещение от оси тела в долях роста (±0.5 ≈ кончики разведённых рук)
 *  - by: высота как доля роста от стоп (0) до макушки (≈1)
 * `icon` — где висит бейдж; `node` — точка на теле, куда приходит линия.
 * AnatomyScene проецирует их реальной камерой, AnatomyAnnotations рисует.
 */
export interface AnnoAnchor {
  icon: { bx: number; by: number };
  node: { bx: number; by: number };
}

export const ANNO_ANCHORS: AnnoAnchor[] = [
  { node: { bx: 0.0, by: 0.94 }, icon: { bx: 0.0, by: 1.07 } },
  { node: { bx: -0.12, by: 0.88 }, icon: { bx: -0.27, by: 0.95 } },
  { node: { bx: -0.17, by: 0.75 }, icon: { bx: -0.34, by: 0.78 } },
  { node: { bx: -0.17, by: 0.61 }, icon: { bx: -0.34, by: 0.62 } },
  { node: { bx: -0.14, by: 0.5 }, icon: { bx: -0.28, by: 0.48 } },
  { node: { bx: 0.12, by: 0.88 }, icon: { bx: 0.27, by: 0.95 } },
  { node: { bx: 0.18, by: 0.76 }, icon: { bx: 0.35, by: 0.79 } },
  { node: { bx: 0.16, by: 0.63 }, icon: { bx: 0.32, by: 0.64 } },
];
