/**
 * Le chevalet de table pour l'aquarelle (2021), en volumes.
 *
 * Chaque pièce est un jeu de faces planes ; `poser()` les place dans l'espace selon
 * l'étape du montage (plateau retourné, tubes au loin, planchette dépliée…).
 * Unités : millimètres. Repère du plateau : x le long des 400 mm, z dans la profondeur
 * (l'avant, côté du peintre, est à +150), y vers le haut (dessous à 0, dessus à 18).
 *
 * Seules les cotes écrites en 2021 sont exactes : 300 × 400, 18 mm à plat, pente de 20 %,
 * feuille de 260 × 360. Le reste (largeur des rives, section des tubes, position des
 * charnières et des aimants) est repris des photos, à l'œil.
 */
import type { V3 } from './marcheur';

export type Matiere = 'hetre' | 'pin' | 'alu' | 'acier' | 'aimant' | 'papier';
export type Piece = 'plateau' | 'tube-arriere' | 'tube-avant' | 'planchette' | 'feuille';

/** Petite pièce plaquée sur une face (charnière, aimant) : dessinée juste après elle. */
export type Pastille = { pts: V3[]; m: Matiere; alpha: number };

export type Face = {
  /** Sommets, dans le sens direct vu de l'extérieur */
  pts: V3[];
  n: V3;
  c: V3;
  m: Matiere;
  piece: Piece;
  /** Filets tracés sur la face : joints du bois, fil, perçages */
  filets: V3[][];
  pastilles: Pastille[];
  alpha: number;
};

export type Pose = {
  /** 0 : dessus en l'air — 1 : plateau retourné, poche visible */
  retourne: number;
  /** 1 : tubes au loin — 0 : en place */
  tubes: number;
  /** 1 : planchette au loin — 0 : en place */
  planchette: number;
  /** 0 : planchette repliée — 1 : dépliée d'équerre */
  ouverture: number;
  /** 0 : pas de feuille — 1 : feuille posée */
  feuille: number;
};

export const LONGUEUR = 400;
export const PROFONDEUR = 300;
export const EPAISSEUR = 18;
export const PENTE = 0.2;
export const FEUILLE = { longueur: 360, largeur: 260 };

const X = LONGUEUR / 2;
const Z = PROFONDEUR / 2;
/** Largeur des rives laissées sur les petits côtés */
const RIVE = 22;
/** Tube carré : largeur, et hauteur = profondeur de la poche */
const TUBE = 12;
const POCHE = 10;
/** Axe des charnières */
const ZH = -Z + TUBE + 10;
const YH = POCHE - 1;
/** Planchette : épaisseur, demi-longueur, et hauteur calculée pour donner la pente de 20 % */
const EP = 8;
const XP = X - RIVE - 8;
export const HAUTEUR_PLANCHETTE = YH + PENTE * (Z - ZH);
const FX = FEUILLE.longueur / 2;
const FZ = FEUILLE.largeur / 2;

type Transfo = (p: V3) => V3;

const lisse = (t: number) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
};

/** Normale d'un polygone plan (méthode de Newell : tient aussi pour un contour non convexe). */
function normale(pts: V3[]): V3 {
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k]!;
    const b = pts[(k + 1) % pts.length]!;
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

function centre(pts: V3[]): V3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
    z += p[2];
  }
  return [x / pts.length, y / pts.length, z / pts.length];
}

type Brute = { pts: V3[]; m: Matiere; piece: Piece; filets: V3[][]; pastilles: Pastille[] };

/** Une face, orientée pour que sa normale pointe vers `dehors`. */
function face(pts: V3[], dehors: V3, m: Matiere, piece: Piece, filets: V3[][] = [], pastilles: Pastille[] = []): Brute {
  const n = normale(pts);
  const sens = n[0] * dehors[0] + n[1] * dehors[1] + n[2] * dehors[2];
  return { pts: sens >= 0 ? pts : [...pts].reverse(), m, piece, filets, pastilles };
}

/** Les six faces d'un pavé. */
function pave(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: Matiere, piece: Piece): Brute[] {
  return [
    face([[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], [0, 1, 0], m, piece),
    face([[x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]], [0, -1, 0], m, piece),
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], m, piece),
    face([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], [0, 0, -1], m, piece),
    face([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], [1, 0, 0], m, piece),
    face([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], m, piece)
  ];
}

/** Disque à 16 côtés dans un plan y = cste. */
function disque(cx: number, y: number, cz: number, r: number): V3[] {
  return Array.from({ length: 16 }, (_, k) => {
    const a = (k / 16) * Math.PI * 2;
    return [cx + r * Math.cos(a), y, cz + r * Math.sin(a)] as V3;
  });
}

/** Joints du hêtre : des lames de 40 mm dans la profondeur, aboutées ici et là. */
function lames(y: number, x0: number, x1: number): V3[][] {
  const filets: V3[][] = [];
  for (let x = -X + 40; x < X - 1; x += 40) {
    if (x > x0 && x < x1) filets.push([[x, y, -Z], [x, y, Z]]);
  }
  for (let k = 0; k < 10; k++) {
    const xa = Math.max(x0, -X + k * 40);
    const xb = Math.min(x1, -X + (k + 1) * 40);
    if (xb <= xa) continue;
    // Positions des aboutages : fixes, différentes d'une lame à l'autre
    const z1 = -Z + ((k * 97 + 60) % 240) + 30;
    const z2 = -Z + ((k * 59 + 150) % 240) + 30;
    filets.push([[xa, y, z1], [xb, y, z1]]);
    if (Math.abs(z2 - z1) > 50) filets.push([[xa, y, z2], [xb, y, z2]]);
  }
  return filets;
}

function plateau(quincaillerie: number): Brute[] {
  const e = EPAISSEUR;
  const p = POCHE;
  const xi = X - RIVE;
  const chantLong = (z: number): V3[] => [
    [-X, 0, z], [-xi, 0, z], [-xi, p, z], [xi, p, z], [xi, 0, z], [X, 0, z], [X, e, z], [-X, e, z]
  ];
  // Sous la planchette repliée : charnières vissées et aimants encastrés dans le fond de la poche
  const pastilles: Pastille[] = [];
  for (const s of [-1, 1]) {
    const xc = s * 105;
    pastilles.push({ pts: [[xc - 11, p, ZH], [xc + 11, p, ZH], [xc + 11, p, ZH + 16], [xc - 11, p, ZH + 16]], m: 'acier', alpha: quincaillerie });
    pastilles.push({ pts: disque(s * 150, p, ZH + HAUTEUR_PLANCHETTE - 13, 5), m: 'aimant', alpha: quincaillerie });
  }
  return [
    face([[-X, e, -Z], [-X, e, Z], [X, e, Z], [X, e, -Z]], [0, 1, 0], 'hetre', 'plateau', lames(e, -X, X)),
    face(chantLong(Z), [0, 0, 1], 'hetre', 'plateau'),
    face(chantLong(-Z), [0, 0, -1], 'hetre', 'plateau'),
    face([[X, 0, -Z], [X, 0, Z], [X, e, Z], [X, e, -Z]], [1, 0, 0], 'hetre', 'plateau'),
    face([[-X, 0, -Z], [-X, 0, Z], [-X, e, Z], [-X, e, -Z]], [-1, 0, 0], 'hetre', 'plateau'),
    // Dessous des deux rives
    face([[xi, 0, -Z], [xi, 0, Z], [X, 0, Z], [X, 0, -Z]], [0, -1, 0], 'hetre', 'plateau'),
    face([[-X, 0, -Z], [-X, 0, Z], [-xi, 0, Z], [-xi, 0, -Z]], [0, -1, 0], 'hetre', 'plateau'),
    // Flancs de la poche
    face([[xi, 0, -Z], [xi, 0, Z], [xi, p, Z], [xi, p, -Z]], [-1, 0, 0], 'hetre', 'plateau'),
    face([[-xi, 0, -Z], [-xi, 0, Z], [-xi, p, Z], [-xi, p, -Z]], [1, 0, 0], 'hetre', 'plateau'),
    // Fond de la poche
    face([[-xi, p, -Z], [-xi, p, Z], [xi, p, Z], [xi, p, -Z]], [0, -1, 0], 'hetre', 'plateau', lames(p, -xi, xi), pastilles)
  ];
}

function tube(z0: number, z1: number, piece: Piece): Brute[] {
  const xi = X - RIVE;
  const faces = pave(-xi, xi, 0, POCHE, z0, z1, 'alu', piece);
  // Tube creux : le carré intérieur se lit sur les deux bouts
  for (const f of faces) {
    const x = f.pts[0]![0];
    if (f.pts.every((q) => q[0] === x)) {
      f.filets.push([[x, 2, z0 + 2], [x, 2, z1 - 2], [x, POCHE - 2, z1 - 2], [x, POCHE - 2, z0 + 2], [x, 2, z0 + 2]]);
    }
  }
  return faces;
}

function planchette(): Brute[] {
  const h = HAUTEUR_PLANCHETTE;
  const faces = pave(-XP, XP, YH - EP, YH, ZH, ZH + h, 'pin', 'planchette');
  const fil = (y: number): V3[][] => [0.2, 0.47, 0.76].map((t) => [[-XP, y, ZH + h * t], [XP, y, ZH + h * t]] as V3[]);
  // Face contre le fond de la poche : charnières et aimants
  const dessus = faces[0]!;
  dessus.filets = fil(YH);
  for (const s of [-1, 1]) {
    const xc = s * 105;
    dessus.pastilles.push({ pts: [[xc - 11, YH, ZH + 2], [xc + 11, YH, ZH + 2], [xc + 11, YH, ZH + 18], [xc - 11, YH, ZH + 18]], m: 'acier', alpha: 1 });
    dessus.pastilles.push({ pts: disque(s * 150, YH, ZH + h - 13, 5), m: 'aimant', alpha: 1 });
  }
  // Face visible quand la planchette est repliée : fil du pin et perçages des aimants
  const dessous = faces[1]!;
  dessous.filets = fil(YH - EP);
  for (const s of [-1, 1]) {
    const cercle = disque(s * 150, YH - EP, ZH + h - 13, 6);
    dessous.filets.push([...cercle, cercle[0]!]);
  }
  return faces;
}

function feuille(): Brute[] {
  const y = EPAISSEUR + 0.6;
  return [face([[-FX, y, -FZ], [-FX, y, FZ], [FX, y, FZ], [FX, y, -FZ]], [0, 1, 0], 'papier', 'feuille')];
}

/** Pivotement de la planchette autour de l'axe des charnières, d'un angle t (radians). */
function charniere(t: number): Transfo {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return (p) => {
    const dz = p[2] - ZH;
    const dy = p[1] - YH;
    return [p[0], YH - dz * s + dy * c, ZH + dz * c + dy * s];
  };
}

/**
 * Angle dont le plateau se lève quand la planchette s'ouvre : il repose sur son arête
 * avant et sur le pied de la planchette. Dépliée d'équerre, la pente vaut 20 %.
 */
export function inclinaison(ouverture: number): number {
  const t = (ouverture * Math.PI) / 2;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const h = HAUTEUR_PLANCHETTE;
  const coins: [number, number][] = [
    [ZH + h * c, YH - h * s],
    [ZH + h * c - EP * s, YH - h * s - EP * c]
  ];
  let a = 0;
  for (const [z, y] of coins) {
    if (y < 0) a = Math.max(a, Math.atan2(-y, Z - z));
  }
  return a;
}

/** Du repère du plateau au monde : inclinaison sur l'arête avant, puis retournement comme une page. */
function versMonde(pose: Pose): Transfo {
  const pasRetourne = 1 - lisse(pose.retourne * 4);
  const a = inclinaison(pose.ouverture) * pasRetourne * (1 - lisse(pose.planchette * 3));
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const phi = pose.retourne * Math.PI;
  const cp = Math.cos(phi);
  const sp = Math.sin(phi);
  const levee = (X + 12) * Math.sin(phi);
  return (p) => {
    // Inclinaison : l'arrière se lève autour de l'arête avant basse
    const u = Z - p[2];
    const y1 = u * sa + p[1] * ca;
    const z1 = Z - (u * ca - p[1] * sa);
    // Retournement comme on tourne une page : autour de l'axe de la profondeur
    const dy = y1 - EPAISSEUR / 2;
    const x2 = p[0] * cp - dy * sp;
    const y2 = p[0] * sp + dy * cp;
    return [x2, y2 + EPAISSEUR / 2 + levee, z1];
  };
}

export type Montage = {
  faces: Face[];
  /** Points remarquables, dans le monde, pour les cotes et les étiquettes */
  ancres: Record<string, V3>;
  /** Un point de la feuille : u de gauche à droite, v de l'arrière vers l'avant, dans [0, 1] */
  surFeuille: (u: number, v: number) => V3;
  /** Un point du dessus du plateau, mêmes conventions */
  surDessus: (u: number, v: number) => V3;
  /** Emprise du plateau au sol (pour l'ombre) */
  emprise: V3[];
  /** Angle du plateau, en radians */
  angle: number;
};

export function poser(pose: Pose): Montage {
  const monde = versMonde(pose);
  const faces: Face[] = [];
  const ajouter = (brutes: Brute[], local: Transfo | null, alpha: number) => {
    if (alpha <= 0.01) return;
    const t: Transfo = local ? (p) => monde(local(p)) : monde;
    for (const b of brutes) {
      const pts = b.pts.map(t);
      faces.push({
        pts,
        n: normale(pts),
        c: centre(pts),
        m: b.m,
        piece: b.piece,
        filets: b.filets.map((f) => f.map(t)),
        pastilles: b.pastilles.map((q) => ({ pts: q.pts.map(t), m: q.m, alpha: q.alpha })),
        alpha
      });
    }
  };

  // Charnières et aimants du fond de la poche : ils apparaissent quand la planchette approche
  ajouter(plateau(1 - lisse(pose.planchette)), null, 1);

  // Tubes : ils arrivent de l'extérieur et du dessous du plateau (le dessus de l'image quand il est retourné)
  const e = lisse(pose.tubes);
  const loinTube = (sens: number): Transfo => (p) => [p[0], p[1] - e * 70, p[2] + sens * e * 150];
  const alphaTube = 1 - lisse((pose.tubes - 0.72) / 0.28);
  ajouter(tube(-Z, -Z + TUBE, 'tube-arriere'), loinTube(-1), alphaTube);
  ajouter(tube(Z - TUBE, Z, 'tube-avant'), loinTube(1), alphaTube);

  // Planchette : elle descend dans la poche, puis pivote sur ses charnières
  const d = lisse(pose.planchette);
  const pivot = charniere((pose.ouverture * Math.PI) / 2);
  const versPlanchette: Transfo = (p) => {
    const q = pivot(p);
    return [q[0], q[1] - d * 130, q[2]];
  };
  ajouter(planchette(), versPlanchette, 1 - lisse((pose.planchette - 0.72) / 0.28));

  // Feuille : elle tombe à plat en tournant un peu
  const f = lisse(pose.feuille);
  const tour = (1 - f) * 0.45;
  const ct = Math.cos(tour);
  const st = Math.sin(tour);
  const versFeuille: Transfo = (p) => [p[0] * ct - p[2] * st, p[1] + (1 - f) * 170, p[0] * st + p[2] * ct];
  ajouter(feuille(), versFeuille, Math.min(1, pose.feuille * 4));

  const h = HAUTEUR_PLANCHETTE;
  const ancres: Record<string, V3> = {
    poche: monde([60, POCHE, 40]),
    tube: monde(loinTube(1)([70, 0, Z - TUBE / 2])),
    planchette: monde(versPlanchette([-150, YH - EP, ZH + h * 0.8])),
    charniere: monde([105, POCHE, ZH + 9]),
    aimant: monde([150, POCHE, ZH + h - 13]),
    'aimant-2': monde([-150, POCHE, ZH + h - 13]),
    dessus: monde([40, EPAISSEUR, -20]),
    pied: monde(versPlanchette([XP, YH - EP / 2, ZH + h])),
    feuille: monde(versFeuille([FX, EPAISSEUR + 0.6, FZ]))
  };

  return {
    faces,
    ancres,
    surFeuille: (u, v) => monde(versFeuille([-FX + 2 * FX * u, EPAISSEUR + 0.9, -FZ + 2 * FZ * v])),
    surDessus: (u, v) => monde([-X + 2 * X * u, EPAISSEUR + 0.2, -Z + 2 * Z * v]),
    emprise: ([[-X, 0, -Z], [-X, 0, Z], [X, 0, Z], [X, 0, -Z]] as V3[]).map(monde),
    angle: inclinaison(pose.ouverture) * (1 - lisse(pose.retourne * 4)) * (1 - lisse(pose.planchette * 3))
  };
}
