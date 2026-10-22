/**
 * Cycle de vie de la vue 3D de l'atelier.
 *
 * L'atelier est un document vivant : ses feuilles s'enchaînent avec les transitions de pages du
 * site (ClientRouter), et la section « Voir » (#voir) est présente sur chaque feuille, persistée
 * d'une page à l'autre (transition:persist). La 3D :
 *  - démarre la première fois que la feuille « Voir » est affichée (pas avant : une arrivée sur
 *    « Monter » ne charge pas le modèle) ;
 *  - reste vivante quand on passe à une autre feuille (la section est cachée, la boucle d'affichage
 *    se met en veille), et revient instantanément ;
 *  - est libérée (géométries, contexte WebGL) quand on quitte l'atelier pour une autre page du
 *    site, et repart de zéro si on y revient.
 * Tout est servi par le site : three.js (élagué), le visualiseur de l'atelier et le modèle
 * (donnees.json, lu en flux avec un pourcentage, en cache long).
 */
import { preparerPalette, habiller, type Habillage, type Pret } from './habillage';

interface Instance {
  voir: HTMLElement;
  generation: number;
  annuler: AbortController;
  habillage: Habillage | null;
}

let instance: Instance | null = null;
let generation = 0;

const racine = () => document.querySelector<HTMLElement>('.atelier');
const sectionVoir = () => document.getElementById('voir');
const surVoir = () => racine()?.dataset.onglet === 'voir';

/** Lit le corps de la réponse par morceaux, en donnant l'avancement (le site connaît la taille décompressée). */
async function lireAvecProgres(r: Response, total: number, progres: (pct: number) => void): Promise<string> {
  if (!r.body) return r.text();
  const lecteur = r.body.getReader();
  const morceaux: Uint8Array[] = [];
  let recu = 0;
  for (;;) {
    const { done, value } = await lecteur.read();
    if (done) break;
    morceaux.push(value);
    recu += value.byteLength;
    if (total > 0) progres(Math.min(99, Math.round((recu / total) * 100)));
  }
  return new Blob(morceaux as BlobPart[]).text();
}

const prochaineImage = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

async function demarrer(voir: HTMLElement) {
  const at = racine();
  if (!at) return;
  const inst: Instance = { voir, generation: ++generation, annuler: new AbortController(), habillage: null };
  instance = inst;
  const vivant = () => instance === inst && voir.isConnected;
  const chargement = voir.querySelector<HTMLElement>('#chargement');
  const dire = (texte: string) => {
    if (chargement && !chargement.classList.contains('panne')) chargement.textContent = texte;
  };
  const raccords = (at.dataset.raccords ?? '').split(' ');
  const url = at.dataset.donnees ?? '';
  const octets = Number(at.dataset.octets) || 0;

  const surPret = (e: Event) => {
    if (!vivant()) return;
    inst.habillage = habiller((e as CustomEvent<Pret>).detail, voir);
  };
  window.addEventListener('atelier:pret', surPret, { once: true });

  try {
    dire('Chargement du modèle…');
    const [visualiseur, r] = await Promise.all([import('./genere/visualiseur'), fetch(url, { signal: inst.annuler.signal })]);
    if (!r.ok) throw new Error(`modèle 3D : réponse ${r.status}`);
    const texte = await lireAvecProgres(r, octets, (pct) => dire(`Chargement du modèle… ${pct} %`));
    if (!vivant()) return;
    dire('Construction du modèle…');
    await prochaineImage();
    if (!vivant()) return;
    preparerPalette();
    if (raccords.includes('donnees')) {
      window.__atelierDonnees = JSON.parse(texte);
    } else {
      // le visualiseur d'origine lit le modèle dans un <script id="donnees">
      const noeud = document.createElement('script');
      noeud.type = 'application/json';
      noeud.id = 'donnees';
      noeud.textContent = texte;
      voir.append(noeud);
    }
    visualiseur.default();
  } catch (e) {
    window.removeEventListener('atelier:pret', surPret);
    if ((e as Error)?.name === 'AbortError' || !vivant()) return;
    const detail = e instanceof Error ? e.message : String(e);
    if (window.__panne) {
      window.__panne("La vue 3D n'a pas pu se charger. Les autres feuilles de l'atelier restent lisibles.", detail);
    } else {
      console.error('atelier :', e);
    }
  }
}

function arreter() {
  if (!instance) return;
  const inst = instance;
  instance = null;
  inst.voir.dataset.actif = '0'; // la boucle d'affichage se met en veille avant la libération
  inst.annuler.abort();
  inst.habillage?.arreter();
}

/** Centre la feuille courante dans le bandeau (téléphone : le bandeau défile) */
function centrerFeuille() {
  const a = document.querySelector<HTMLElement>('.atelier-onglets a[aria-current="page"]');
  const bande = a?.closest<HTMLElement>('.atelier-onglets');
  if (!a || !bande || bande.scrollWidth <= bande.clientWidth) return;
  bande.scrollLeft = a.offsetLeft - (bande.clientWidth - a.offsetWidth) / 2;
}

/** À chaque page : la section « Voir » est-elle là, affichée, démarrée ? */
function surPage() {
  const voir = sectionVoir();
  if (!voir) {
    arreter(); // on a quitté l'atelier
    return;
  }
  if (instance && instance.voir !== voir) arreter(); // une autre section (retour dans l'atelier) : on repart
  const actif = surVoir();
  voir.dataset.actif = actif ? '1' : '0';
  if (actif && !instance) demarrer(voir);
  centrerFeuille();
}

// L'état d'affichage se règle dès l'échange du DOM (avant la peinture), le reste à la fin de la navigation
document.addEventListener('astro:after-swap', () => {
  const voir = sectionVoir();
  if (voir) voir.dataset.actif = surVoir() ? '1' : '0';
  else arreter();
});
document.addEventListener('astro:page-load', surPage);
surPage();
