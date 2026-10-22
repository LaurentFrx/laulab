/**
 * Accès, côté construction du site, à l'atelier importé (src/atelier/genere/, voir
 * scripts/atelier/importer.mjs) : sommaire, contenu des onglets, adresses des fichiers.
 */
import sommaire from './genere/sommaire.json';

export { sommaire };
export type Onglet = (typeof sommaire.onglets)[number];

const fragments = import.meta.glob<string>('./genere/onglets/*.html', { query: '?raw', import: 'default', eager: true });
// PDF, tableur… : émis par Vite sous /_astro/ avec une empreinte dans le nom (cache long)
const fichiers = import.meta.glob<string>('./genere/fichiers/*', { query: '?url', import: 'default', eager: true });
const panne = import.meta.glob<string>('./genere/panne.js', { query: '?raw', import: 'default', eager: true });

/** Contenu HTML d'un onglet, adresses des fichiers posées. */
export function contenu(id: string): string {
  const html = fragments[`./genere/onglets/${id}.html`];
  if (html === undefined) throw new Error(`atelier : onglet ${id} absent de l'import`);
  return html.replace(/@@FICHIER:([\w.-]+)@@/g, (_, nom: string) => fichiers[`./genere/fichiers/${nom}`] ?? '#');
}

/** Script d'affichage des pannes de la 3D (de l'atelier), à poser avant le visualiseur. */
export const scriptPanne: string = panne['./genere/panne.js'] ?? '';

/** Numéro de feuille (1 = Voir) et nombre de feuilles */
export function feuille(id: string): { numero: number; total: number } {
  return { numero: sommaire.onglets.findIndex((o) => o.id === id) + 1, total: sommaire.onglets.length };
}

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** Date de la version importée, au format « 4 octobre 2026 », et au format AAAA-MM-JJ */
export function dateVersion(): { lisible: string; iso: string } | null {
  const d = sommaire.source.date;
  if (!d) return null;
  const [a, m, j] = d.slice(0, 10).split('-').map(Number);
  return { lisible: `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}`, iso: d.slice(0, 10) };
}
