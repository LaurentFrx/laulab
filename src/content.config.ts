import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Collection « projets » : une planche par projet.
 * Pour ajouter un projet : créer src/content/projets/<slug>.md avec ce frontmatter.
 */
const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: z.object({
    /** Titre affiché (désignation dans la nomenclature) */
    titre: z.string(),
    /** Une phrase, affichée sous le titre et dans les listes */
    accroche: z.string(),
    /** Catégorie de la nomenclature */
    categorie: z.enum(['applications', 'robots', 'atelier', 'energie']),
    /** État d'avancement — pilote le tampon */
    statut: z.enum(['en-ligne', 'en-service', 'termine', 'en-chantier', 'a-l-etude']),
    /** Période lisible, ex. « mars → mai 2026 » ou « depuis juin 2026 » */
    periode: z.string(),
    /** AAAA-MM du début, pour le tri */
    debut: z.string().regex(/^\d{4}-\d{2}$/),
    /** Numéro de repère dans la nomenclature (ordre d'affichage) */
    repere: z.number().int().positive(),
    /** Matières : stack logicielle et matériel */
    matieres: z.array(z.string()),
    /** Liens externes (site, dépôt, documentation) */
    liens: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    /** Nom du dessin SVG (src/components/figures/<nom>.astro) ; sinon vue à compléter */
    figure: z.string().optional(),
    /** Légende du dessin : repères numérotés */
    reperes: z.array(z.string()).default([]),
    /** Mis en avant sur la planche 00 */
    vedette: z.boolean().default(false),
    /** Où : « Maison », « BiscaLab », « VPS »… */
    lieu: z.string().optional(),
    /** Répartition du travail, en listes courtes */
    collaboration: z.object({
      laurent: z.array(z.string()),
      claude: z.array(z.string())
    }),
    /** Atelier du projet (pages du site qui en reprennent le dossier de fabrication) */
    atelier: z
      .object({
        /** Adresse dans le site, ex. « /projets/jansenosaure/atelier/ » */
        url: z.string().regex(/^\/.*\/$/),
        /** Une phrase : ce qu'on y trouve */
        description: z.string()
      })
      .optional(),
    /** Révision de la planche (lettre) */
    revision: z.string().default('A')
  })
});

export const collections = { projets };
