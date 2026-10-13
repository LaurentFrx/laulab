/**
 * Petit moteur de projection : une caméra en orbite autour d'une cible,
 * projection perspective, et un bruit fractal pour les mouvements organiques.
 * Pas de dépendance : tout tient en quelques fonctions.
 */
import type { V3 } from './marcheur';

export type Camera = {
  /** Lacet en radians : 0 = vue de côté (caméra sur +z), π/2 = caméra sur +x */
  lacet: number;
  /** Tangage en radians : 0 = à l'horizontale, π/2 = vue de dessus */
  tangage: number;
  distance: number;
  cible: V3;
  /** Champ vertical en radians */
  champ: number;
};

export type Projete = { x: number; y: number; z: number } | null;

export type Ecran = { w: number; h: number; cx: number; cy: number };

/** Base de la caméra (position, droite, haut, avant), recalculée une fois par image. */
export function baseCamera(c: Camera) {
  const cp = Math.cos(c.tangage);
  const sp = Math.sin(c.tangage);
  const cl = Math.cos(c.lacet);
  const sl = Math.sin(c.lacet);
  const pos: V3 = [c.cible[0] + c.distance * sl * cp, c.cible[1] + c.distance * sp, c.cible[2] + c.distance * cl * cp];
  // avant = cible - pos, normalisé
  let fx = c.cible[0] - pos[0];
  let fy = c.cible[1] - pos[1];
  let fz = c.cible[2] - pos[2];
  const fn = Math.hypot(fx, fy, fz) || 1;
  fx /= fn;
  fy /= fn;
  fz /= fn;
  // droite = avant × haut(0,1,0)
  let rx = fy * 0 - fz * 1;
  let ry = fz * 0 - fx * 0;
  let rz = fx * 1 - fy * 0;
  const rn = Math.hypot(rx, ry, rz) || 1;
  rx /= rn;
  ry /= rn;
  rz /= rn;
  // haut = droite × avant
  const ux = ry * fz - rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy - ry * fx;
  return { pos, f: [fx, fy, fz] as V3, r: [rx, ry, rz] as V3, u: [ux, uy, uz] as V3, focale: 1 / Math.tan(c.champ / 2) };
}

export type Base = ReturnType<typeof baseCamera>;

/** Projette un point ; null s'il est derrière la caméra. */
export function projeter(p: V3, b: Base, e: Ecran): Projete {
  const dx = p[0] - b.pos[0];
  const dy = p[1] - b.pos[1];
  const dz = p[2] - b.pos[2];
  const z = dx * b.f[0] + dy * b.f[1] + dz * b.f[2];
  if (z < 1) return null;
  const x = dx * b.r[0] + dy * b.r[1] + dz * b.r[2];
  const y = dx * b.u[0] + dy * b.u[1] + dz * b.u[2];
  const k = (b.focale * e.h) / 2 / z;
  return { x: e.cx + x * k, y: e.cy - y * k, z };
}

/** Bruit de valeur 1D, lisse, dans [-1, 1]. */
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}
function bruit(t: number): number {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

/** Mouvement brownien fractionnaire : trois octaves de bruit de valeur. */
export function fbm(t: number, graine = 0): number {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 3; o++) {
    v += amp * bruit(t * freq + graine * 17.3);
    amp *= 0.5;
    freq *= 2.1;
  }
  return v;
}

export const lisse = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const borne = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Interpolation entre images-clés (clé → valeurs), progression p ∈ [0,1]. */
export function imagesCles<T extends Record<string, number>>(cles: { p: number; v: T }[], p: number): T {
  if (p <= cles[0]!.p) return cles[0]!.v;
  for (let k = 1; k < cles.length; k++) {
    const a = cles[k - 1]!;
    const b = cles[k]!;
    if (p <= b.p) {
      const t = lisse((p - a.p) / (b.p - a.p));
      const out: Record<string, number> = {};
      for (const cle of Object.keys(a.v)) out[cle] = lerp(a.v[cle]!, b.v[cle]!, t);
      return out as T;
    }
  }
  return cles[cles.length - 1]!.v;
}
