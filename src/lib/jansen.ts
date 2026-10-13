/**
 * Mécanisme de Jansen — cinématique d'une patte.
 * Les treize longueurs sont les « nombres sacrés » de Theo Jansen.
 * Repère mathématique : origine au centre de la manivelle, y vers le haut.
 */
export const JANSEN = {
  a: 38.0, // distance horizontale manivelle → pivot fixe
  b: 41.5, // pivot fixe → sommet B (triangle supérieur)
  c: 39.3, // pivot fixe → articulation E (bas)
  d: 40.1, // pivot fixe → sommet D (triangle supérieur)
  e: 55.8, // B → D (grand côté du triangle supérieur)
  f: 39.4, // D → G (bielle de liaison)
  g: 36.7, // E → G (triangle inférieur)
  h: 65.7, // G → H, le pied
  i: 49.0, // E → H, le pied
  j: 50.0, // manivelle → B
  k: 61.9, // manivelle → E
  l: 7.8, // décalage vertical du pivot fixe
  m: 15.0 // rayon de manivelle
} as const;

export type Pt = readonly [number, number];
export type Pose = { O: Pt; F: Pt; C: Pt; B: Pt; D: Pt; E: Pt; G: Pt; H: Pt };

/** Intersection de deux cercles ; `side` choisit la solution (gauche/droite de p→q). */
export function intersection(p: Pt, rp: number, q: Pt, rq: number, side: 1 | -1): Pt {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const dd = Math.hypot(dx, dy) || 1e-9;
  const x = (rp * rp - rq * rq + dd * dd) / (2 * dd);
  const y = Math.sqrt(Math.max(rp * rp - x * x, 0));
  const ux = dx / dd;
  const uy = dy / dd;
  return [p[0] + x * ux - side * y * uy, p[1] + x * uy + side * y * ux];
}

/** Position de toutes les articulations pour un angle de manivelle (radians). */
export function pose(theta: number): Pose {
  const { a, b, c, d, e, f, g, h, i, j, k, l, m } = JANSEN;
  const O: Pt = [0, 0];
  const F: Pt = [-a, -l];
  const C: Pt = [m * Math.cos(theta), m * Math.sin(theta)];
  const B = intersection(C, j, F, b, -1);
  const D = intersection(F, d, B, e, 1);
  const E = intersection(C, k, F, c, 1);
  const G = intersection(D, f, E, g, -1);
  const H = intersection(E, i, G, h, 1);
  return { O, F, C, B, D, E, G, H };
}

/** Trajectoire du pied sur un tour complet. */
export function trajectoire(n = 144): Pt[] {
  const pts: Pt[] = [];
  for (let s = 0; s < n; s++) pts.push(pose((s / n) * Math.PI * 2).H);
  return pts;
}

/** Segments dessinés : [de, à, classe, étiquette de cote] */
export const SEGMENTS: [keyof Pose, keyof Pose, string, string][] = [
  ['O', 'C', 'crayon', 'm'],
  ['C', 'B', 'moyen', 'j'],
  ['C', 'E', 'moyen', 'k'],
  ['F', 'B', 'fort', 'b'],
  ['B', 'D', 'fort', 'e'],
  ['F', 'D', 'fort', 'd'],
  ['F', 'E', 'moyen', 'c'],
  ['D', 'G', 'moyen', 'f'],
  ['E', 'G', 'fort', 'g'],
  ['G', 'H', 'fort', 'h'],
  ['E', 'H', 'fort', 'i']
];

/** Valeur affichée d'une longueur, virgule décimale. */
export function valeur(cle: keyof typeof JANSEN): string {
  const v = JANSEN[cle];
  return Number.isInteger(v) ? String(v) : String(v).replace('.', ',');
}

/** Point milieu d'un segment, décalé perpendiculairement (pour poser une cote). */
export function milieuDecale(p: Pt, q: Pt, decalage: number): Pt {
  const mx = (p[0] + q[0]) / 2;
  const my = (p[1] + q[1]) / 2;
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const dd = Math.hypot(dx, dy) || 1;
  return [mx - (dy / dd) * decalage, my + (dx / dd) * decalage];
}
