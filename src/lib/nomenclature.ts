import type { CollectionEntry } from 'astro:content';

export type Projet = CollectionEntry<'projets'>;
export type Categorie = Projet['data']['categorie'];
export type Statut = Projet['data']['statut'];

export const CATEGORIES: Record<Categorie, { label: string; court: string }> = {
  applications: { label: 'Applications', court: 'App.' },
  robots: { label: 'Robots', court: 'Rob.' },
  atelier: { label: 'Atelier & électronique', court: 'Atel.' },
  energie: { label: 'Énergie & systèmes', court: 'Éner.' }
};

export const STATUTS: Record<Statut, { label: string; description: string }> = {
  'en-ligne': { label: 'En ligne', description: 'Publié et accessible à tous' },
  'en-service': { label: 'En service', description: 'Installé, utilisé tous les jours' },
  termine: { label: 'Terminé', description: 'Livré, clos' },
  'en-chantier': { label: 'En chantier', description: 'En cours de réalisation' },
  'a-l-etude': { label: "À l'étude", description: 'Conception en cours, rien de construit' }
};

export const ORDRE_CATEGORIES: Categorie[] = ['applications', 'robots', 'atelier', 'energie'];

/** Numéro de planche à deux chiffres, d'après le repère */
export function numeroPlanche(p: Projet): string {
  return String(p.data.repere).padStart(2, '0');
}

export function trierParRepere(projets: Projet[]): Projet[] {
  return [...projets].sort((a, b) => a.data.repere - b.data.repere);
}

export function parCategorie(projets: Projet[]): { categorie: Categorie; projets: Projet[] }[] {
  return ORDRE_CATEGORIES.map((categorie) => ({
    categorie,
    projets: trierParRepere(projets.filter((p) => p.data.categorie === categorie))
  })).filter((g) => g.projets.length > 0);
}

/** « 2026-03 » → « mars 2026 » */
export function moisLisible(aaaaMm: string): string {
  const [a, m] = aaaaMm.split('-').map(Number);
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  return `${mois[(m ?? 1) - 1]} ${a}`;
}
