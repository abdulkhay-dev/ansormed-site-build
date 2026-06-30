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

// Порядок СТРОГО как у иконок в AnatomyAnnotations:
// Brain, Heart, Activity(ЭКГ), Dna, Atom, HeartPulse, Microscope, Stethoscope.
// node — точка на нужном органе, icon — где висит бейдж.
export const ANNO_ANCHORS: AnnoAnchor[] = [
  // Brain → мозг (голова)
  { node: { bx: 0.0, by: 0.92 }, icon: { bx: 0.0, by: 1.06 } },
  // Heart → сердце (грудь)
  { node: { bx: 0.05, by: 0.71 }, icon: { bx: 0.3, by: 0.84 } },
  // Activity (ЭКГ) → грудь/сердце
  { node: { bx: -0.03, by: 0.68 }, icon: { bx: -0.3, by: 0.84 } },
  // Dna → торс
  { node: { bx: -0.04, by: 0.52 }, icon: { bx: -0.32, by: 0.46 } },
  // Atom → живот (выше, чтобы не указывал между ног)
  { node: { bx: -0.05, by: 0.57 }, icon: { bx: -0.24, by: 0.3 } },
  // HeartPulse → сердце/грудь
  { node: { bx: 0.08, by: 0.65 }, icon: { bx: 0.34, by: 0.66 } },
  // Microscope → нижний торс (анализы/почки)
  { node: { bx: 0.06, by: 0.53 }, icon: { bx: 0.32, by: 0.46 } },
  // Stethoscope → лёгкие/грудь
  { node: { bx: -0.08, by: 0.71 }, icon: { bx: -0.34, by: 0.66 } },
];
