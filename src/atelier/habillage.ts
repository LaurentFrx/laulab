/**
 * Habillage « plan d'ingénieur » de la vue 3D de l'atelier.
 *
 * Le visualiseur vient tel quel de l'atelier (src/atelier/genere/visualiseur.ts). L'import y pose
 * trois raccords, et ce module s'y branche :
 *  - window.__atelierMatieres(MAT) : appelé avant la construction des pièces, règle la palette ;
 *  - window.__atelierSurligne : couleur de surlignage d'une pièce survolée ou cliquée ;
 *  - l'évènement « atelier:pret » : le modèle est construit, on ajoute les arêtes, on règle la
 *    lumière, et on suit le changement de thème (cyanotype / calque).
 * Si un raccord manque (l'atelier a changé), la 3D marche quand même, avec ses couleurs d'origine.
 */

type Theme = 'cyanotype' | 'calque';

interface Teinte {
  /** couleur affichée voulue, en sRGB */
  c: string;
  /** métal (0 à 1) */
  m?: number;
  /** rugosité (0 à 1) */
  r?: number;
}

interface Palette {
  matieres: Record<string, Teinte>;
  aretes: { c: string; opacite: number };
  surligne: string;
  ciel: string;
  terre: string;
}

// Teintes des matières : chaque matière garde sa place dans l'échelle des valeurs (le corps plus
// clair que les pattes, l'acier plus clair que le bois, le PETG et les courroies sombres), dans les
// bleus du plan. Les douilles de laiton prennent la couleur des cotes.
const PALETTES: Record<Theme, Palette> = {
  cyanotype: {
    matieres: {
      ctp: { c: '#4d7199' },
      ctp_peuplier: { c: '#7393b6' },
      ctp5: { c: '#3d6089' },
      petg: { c: '#132b47', r: 0.5, m: 0 },
      acier: { c: '#b4c4d6', m: 0.35, r: 0.4 },
      laiton: { c: '#8fd8ff', m: 0.3, r: 0.45 },
      nylon: { c: '#e4edf6' },
      tpu: { c: '#22426a' },
      caoutchouc: { c: '#0d1f35' },
      moteur: { c: '#2a4868', m: 0.3, r: 0.5 }
    },
    aretes: { c: '#dce9f5', opacite: 0.5 },
    surligne: '#ff6a3d',
    ciel: '#ffffff',
    terre: '#1a3350'
  },
  calque: {
    matieres: {
      ctp: { c: '#c2d1e1' },
      ctp_peuplier: { c: '#dde7f1' },
      ctp5: { c: '#acbed1' },
      petg: { c: '#2a4a6e', r: 0.5, m: 0 },
      acier: { c: '#8ea2b7', m: 0.35, r: 0.4 },
      laiton: { c: '#0a6fb5', m: 0.3, r: 0.45 },
      nylon: { c: '#ffffff' },
      tpu: { c: '#3a5a7c' },
      caoutchouc: { c: '#1d3552' },
      moteur: { c: '#4a6584', m: 0.3, r: 0.5 }
    },
    aretes: { c: '#143a5e', opacite: 0.55 },
    surligne: '#d8432b',
    ciel: '#ffffff',
    terre: '#9fb3c8'
  }
};

/** Angle (en degrés) au-delà duquel deux faces voisines dessinent une arête */
const SEUIL_ARETES = 30;

const theme = (): Theme => (document.documentElement.dataset.theme === 'calque' ? 'calque' : 'cyanotype');

const versNombre = (hex: string) => parseInt(hex.slice(1), 16);

/** three.js r128 sans gestion des couleurs : une teinte sRGB doit être passée en linéaire. */
function lineaire(hex: string): number {
  const n = versNombre(hex);
  const canal = (v: number) => {
    const c = v / 255;
    const l = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return Math.round(l * 255);
  };
  return (canal((n >> 16) & 255) << 16) | (canal((n >> 8) & 255) << 8) | canal(n & 255);
}

interface Matiere {
  c: number;
  r: number;
  m: number;
  css: string;
}

interface Piece {
  mesh: any;
  m: { mat: string; id: string };
}

interface Pret {
  THREE: any;
  scene: any;
  pieces: Map<string, Piece>;
  MAT: Record<string, Matiere>;
  redessiner: () => void;
  /** caméra en orbite du visualiseur (absente si l'atelier a changé) */
  orb?: { dist: number };
  poseCam?: () => void;
}

/** Forme d'écran pour laquelle les points de vue de l'atelier sont réglés (largeur / hauteur) */
const ASPECT_REFERENCE = 1.25;

declare global {
  interface Window {
    __atelierMatieres?: (mat: Record<string, Matiere>) => void;
    __atelierSurligne?: number;
    __panne?: (titre: string, detail?: string) => void;
  }
}

function appliquerPalette(MAT: Record<string, Matiere>, p: Palette) {
  for (const k in MAT) {
    const t = p.matieres[k];
    if (!t) continue; // matière nouvelle : elle garde sa couleur d'origine
    MAT[k].c = lineaire(t.c);
    MAT[k].css = t.c;
    if (t.m !== undefined) MAT[k].m = t.m;
    if (t.r !== undefined) MAT[k].r = t.r;
  }
}

export function preparerHabillage() {
  window.__atelierMatieres = (MAT) => appliquerPalette(MAT, PALETTES[theme()]);
  window.__atelierSurligne = lineaire(PALETTES[theme()].surligne);
  window.addEventListener('atelier:pret', (e) => habiller((e as CustomEvent<Pret>).detail), { once: true });
}

function habiller({ THREE, scene, pieces, MAT, redessiner, orb, poseCam }: Pret) {
  const materielAretes = new THREE.LineBasicMaterial({ transparent: true, depthWrite: false });

  // Le sol devient une surface sans éclairage : il prend exactement la couleur demandée
  // (--at-sol, lue par le visualiseur), la grille du plan semble posée sur le papier.
  const sol = scene.getObjectByName('sol');
  if (sol) {
    const ancien = sol.material;
    sol.material = new THREE.MeshBasicMaterial({ color: ancien.color.clone() });
    ancien.dispose();
  }

  function eclairage(p: Palette) {
    scene.traverse((o: any) => {
      if (o.isHemisphereLight) {
        o.color.setHex(lineaire(p.ciel));
        o.groundColor.setHex(lineaire(p.terre));
      } else if (o.isDirectionalLight) {
        o.color.setHex(0xffffff);
      }
    });
  }

  function recolorer() {
    const p = PALETTES[theme()];
    appliquerPalette(MAT, p);
    window.__atelierSurligne = lineaire(p.surligne);
    for (const { mesh, m } of pieces.values()) {
      const spec = MAT[m.mat];
      if (!spec) continue;
      mesh.material.color.setHex(spec.c);
      mesh.material.roughness = spec.r;
      mesh.material.metalness = spec.m;
    }
    // la légende des matières suit l'ordre de MAT
    const pastilles = document.querySelectorAll<HTMLElement>('#legende i');
    Object.keys(MAT).forEach((k, i) => {
      if (pastilles[i]) pastilles[i].style.background = MAT[k].css;
    });
    materielAretes.color.setHex(lineaire(p.aretes.c));
    materielAretes.opacity = p.aretes.opacite;
    eclairage(p);
    redessiner();
  }

  // Les faces reculent d'un cheveu pour que les arêtes se dessinent sans scintiller
  for (const { mesh } of pieces.values()) {
    mesh.material.polygonOffset = true;
    mesh.material.polygonOffsetFactor = 1;
    mesh.material.polygonOffsetUnits = 1;
    mesh.material.needsUpdate = true;
  }
  recolorer();

  // Arêtes : calculées par petits lots après le premier affichage, pour ne pas figer la page
  const file = [...pieces.values()];
  const lot = () => {
    const fin = performance.now() + 12;
    while (file.length && performance.now() < fin) {
      const { mesh } = file.shift()!;
      const lignes = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, SEUIL_ARETES), materielAretes);
      lignes.raycast = () => {}; // le clic sur une pièce ne doit pas voir ses arêtes
      mesh.add(lignes);
    }
    redessiner();
    if (file.length) setTimeout(lot, 0);
  };
  setTimeout(lot, 50);

  new MutationObserver(recolorer).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Écran en hauteur (téléphone) : les points de vue de l'atelier coupent le robot ; on recule la
  // caméra d'autant que l'écran est étroit. Appliqué au départ et après chaque bouton de vue.
  const scene3d = document.getElementById('scene');
  if (orb && poseCam && scene3d) {
    const cadrer = () => {
      const aspect = scene3d.clientWidth / Math.max(1, scene3d.clientHeight);
      if (aspect >= ASPECT_REFERENCE) return;
      orb.dist *= Math.pow(ASPECT_REFERENCE / aspect, 0.8);
      poseCam();
    };
    cadrer();
    document.querySelectorAll('#vues button').forEach((b) => b.addEventListener('click', cadrer));
  }
}
