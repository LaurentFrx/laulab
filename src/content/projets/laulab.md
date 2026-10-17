---
titre: L@uL@b, ce site
accroche: Les planches que vous lisez — un site statique dessiné comme un jeu de plans.
categorie: applications
statut: en-chantier
periode: depuis octobre 2026
debut: 2026-10
repere: 19
figure: logo
lieu: VPS
matieres:
  - Astro
  - SVG et CSS
  - Polices Anybody, Atkinson Hyperlegible, osifont
  - Caddy
collaboration:
  laurent:
    - Direction artistique choisie parmi trois propositions, inventaire des projets, relecture
  claude:
    - Conception du site, dessins techniques, mécanisme de Jansen animé, mise en page et code
revision: A
---

Ce site rassemble ce que j'ai construit ces derniers mois. Il est dessiné comme un jeu de plans d'ingénieur : chaque projet a sa planche, son cartouche, ses repères, et la nomenclature en fait l'inventaire.

## Comment il est fait

Un site statique, généré par Astro : chaque projet est un fichier texte avec un en-tête (titre, statut, matières, liens) et quelques paragraphes. Ajouter un projet, c'est ajouter un fichier. Les dessins sont des SVG écrits à la main ; le mécanisme de Jansen de la page d'accueil est calculé en direct dans le navigateur.

## Polices

Les titres sont en Anybody, le texte en Atkinson Hyperlegible, et les cotes en osifont, une police libre qui suit la norme ISO 3098 du lettrage technique. Tout est hébergé ici, sans appel à un service tiers.
