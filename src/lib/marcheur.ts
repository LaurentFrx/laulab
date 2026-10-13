/**
 * Jansenosaure en fil de fer : quatre pattes de Jansen, deux par côté,
 * un vilebrequin commun, un châssis. Tout est décrit en segments 3D.
 *
 * Repère : x vers l'avant (sens de la marche), y vers le haut, z vers la droite de la bête.
 * Unités : celles des nombres de Jansen (la manivelle fait 15).
 */
import { pose, trajectoire, JANSEN, type Pt } from './jansen';

export type V3 = readonly [number, number, number];
export type Trait = 'fort' | 'moyen' | 'fin' | 'crayon' | 'cache';
export type Segment = { a: V3; b: V3; t: Trait };

/** Écartement entre les deux côtés (axe z). */
export const LARGEUR = 92;
/** Hauteur du châssis au-dessus de l'axe de manivelle. */
const HAUT_CHASSIS = 30;
/** Demi-longueur du châssis. */
const DEMI_CHASSIS = 54;

const TRAJ = trajectoire(180);
/** Altitude du sol : le point le plus bas du pied. */
export const SOL = Math.min(...TRAJ.map((p) => p[1]));

/**
 * Centre de l'arc d'appui (angle de manivelle pour lequel le pied est au milieu de sa phase au sol),
 * mesuré sur la patte de référence. Il sert à caler les phases pour que les quatre appuis
 * se répartissent tous les quarts de tour.
 */
function centreAppui(): number {
  let sx = 0;
  let sy = 0;
  const n = 720;
  for (let k = 0; k < n; k++) {
    const th = (k / n) * Math.PI * 2;
    if (pose(th).H[1] < SOL + 1.5) {
      sx += Math.cos(th);
      sy += Math.sin(th);
    }
  }
  return Math.atan2(sy, sx);
}
const CENTRE = centreAppui();
/** Une patte miroir voit son angle inversé (π − θ) : cette phase ramène son appui à l'opposé de la patte de référence. */
const PHASE_PATTE = -2 * CENTRE;
/** Quart de tour entre les deux côtés. */
const PHASE_COTE = Math.PI / 2;

/** Les pattes : côté (z), miroir (patte avant), phase. */
export const PATTES = [
  { nom: 'arrière gauche', z: -LARGEUR / 2, miroir: false, phase: 0 },
  { nom: 'avant gauche', z: -LARGEUR / 2, miroir: true, phase: PHASE_PATTE },
  { nom: 'arrière droite', z: LARGEUR / 2, miroir: false, phase: PHASE_COTE },
  { nom: 'avant droite', z: LARGEUR / 2, miroir: true, phase: PHASE_PATTE + PHASE_COTE }
] as const;

/** Segments d'une patte dans son plan, puis placés en 3D. */
const SEGS_PATTE: [string, string, Trait][] = [
  ['O', 'C', 'crayon'],
  ['C', 'B', 'moyen'],
  ['C', 'E', 'moyen'],
  ['F', 'B', 'fort'],
  ['B', 'D', 'fort'],
  ['F', 'D', 'fort'],
  ['F', 'E', 'moyen'],
  ['D', 'G', 'moyen'],
  ['E', 'G', 'fort'],
  ['G', 'H', 'fort'],
  ['E', 'H', 'fort']
];

/** Angle local de la manivelle pour une patte, selon son miroir et sa phase. */
function angleLocal(theta: number, miroir: boolean, phase: number): number {
  const t = theta + phase;
  return miroir ? Math.PI - t : t;
}

function place(p: Pt, miroir: boolean, z: number): V3 {
  return [miroir ? -p[0] : p[0], p[1], z];
}

/** Position 3D du pied de chaque patte, dans l'ordre de PATTES. */
export function pieds(theta: number): V3[] {
  return PATTES.map((pa) => place(pose(angleLocal(theta, pa.miroir, pa.phase)).H, pa.miroir, pa.z));
}

/** Point remarquable d'une patte (O, F, C, H…) en 3D. */
export function point(theta: number, patte: number, nom: keyof ReturnType<typeof pose>): V3 {
  const pa = PATTES[patte]!;
  return place(pose(angleLocal(theta, pa.miroir, pa.phase))[nom], pa.miroir, pa.z);
}

/** Tous les segments du marcheur pour un angle de manivelle. */
export function marcheur(theta: number): Segment[] {
  const segs: Segment[] = [];
  for (const pa of PATTES) {
    const P = pose(angleLocal(theta, pa.miroir, pa.phase));
    for (const [a, b, t] of SEGS_PATTE) {
      segs.push({ a: place(P[a as keyof typeof P], pa.miroir, pa.z), b: place(P[b as keyof typeof P], pa.miroir, pa.z), t });
    }
  }
  // Châssis : deux rails à hauteur des pivots, deux longerons hauts, montants et traverses
  const yR = -JANSEN.l;
  const xF = JANSEN.a;
  for (const z of [-LARGEUR / 2, LARGEUR / 2]) {
    segs.push({ a: [-xF, yR, z], b: [xF, yR, z], t: 'fort' });
    segs.push({ a: [-xF, yR, z], b: [0, 0, z], t: 'moyen' });
    segs.push({ a: [xF, yR, z], b: [0, 0, z], t: 'moyen' });
    segs.push({ a: [-DEMI_CHASSIS, HAUT_CHASSIS, z], b: [DEMI_CHASSIS, HAUT_CHASSIS, z], t: 'fort' });
    segs.push({ a: [-xF, yR, z], b: [-DEMI_CHASSIS, HAUT_CHASSIS, z], t: 'moyen' });
    segs.push({ a: [xF, yR, z], b: [DEMI_CHASSIS, HAUT_CHASSIS, z], t: 'moyen' });
  }
  // Traverses
  segs.push({ a: [-xF, yR, -LARGEUR / 2], b: [-xF, yR, LARGEUR / 2], t: 'fort' });
  segs.push({ a: [xF, yR, -LARGEUR / 2], b: [xF, yR, LARGEUR / 2], t: 'fort' });
  segs.push({ a: [-DEMI_CHASSIS, HAUT_CHASSIS, -LARGEUR / 2], b: [-DEMI_CHASSIS, HAUT_CHASSIS, LARGEUR / 2], t: 'fort' });
  segs.push({ a: [DEMI_CHASSIS, HAUT_CHASSIS, -LARGEUR / 2], b: [DEMI_CHASSIS, HAUT_CHASSIS, LARGEUR / 2], t: 'fort' });
  // Vilebrequin (axe de manivelle) d'un côté à l'autre, avec un moteur par côté
  segs.push({ a: [0, 0, -LARGEUR / 2 - 10], b: [0, 0, LARGEUR / 2 + 10], t: 'moyen' });
  for (const s of [-1, 1]) {
    const z0 = s * (LARGEUR / 2 + 10);
    const z1 = s * (LARGEUR / 2 + 22);
    // Moteur : petit cadre carré au bout de l'axe
    for (const [dx, dy] of [[-8, -8], [8, -8], [8, 8], [-8, 8]] as const) {
      const k = [[-8, -8], [8, -8], [8, 8], [-8, 8]] as const;
      const i = k.findIndex(([x, y]) => x === dx && y === dy);
      const n = k[(i + 1) % 4]!;
      segs.push({ a: [dx, dy, z0], b: [n[0], n[1], z0], t: 'fin' });
      segs.push({ a: [dx, dy, z1], b: [n[0], n[1], z1], t: 'fin' });
      segs.push({ a: [dx, dy, z0], b: [dx, dy, z1], t: 'fin' });
    }
  }
  return segs;
}

/** Trajectoire du pied d'une patte, en 3D (fermée). */
export function trajectoirePied(patte: number): V3[] {
  const pa = PATTES[patte]!;
  return TRAJ.map((p) => place(p, pa.miroir, pa.z));
}

/**
 * Vitesse d'avance : pendant l'appui, le pied recule par rapport au châssis ;
 * le sol doit défiler à la même vitesse pour que la marche soit crédible.
 * On la mesure sur la trajectoire, avec la manivelle qui tourne dans le sens du rendu (theta décroissant).
 */
export function vitesseAvance(dureeTourMs: number): number {
  const n = 720;
  let dx = 0;
  let nb = 0;
  for (let k = 0; k < n; k++) {
    const t0 = -(k / n) * Math.PI * 2;
    const t1 = -((k + 1) / n) * Math.PI * 2;
    const a = pose(t0).H;
    const b = pose(t1).H;
    if (a[1] < SOL + 1.5 && b[1] < SOL + 1.5) {
      dx += b[0] - a[0];
      nb++;
    }
  }
  if (!nb) return 0;
  const dureeAppuiMs = (nb / n) * dureeTourMs;
  // La patte arrière (non miroir) est orientée vers -x : son pied recule (dx < 0) pendant l'appui.
  // Le sol défile donc dans le sens de dx ; la bête avance dans le sens opposé.
  return dx / dureeAppuiMs; // unités par milliseconde, signé
}
