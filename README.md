# L@uL@b — laulab.feroux.fr

Site personnel de Laurent Feroux : un jeu de planches, une par projet, dessiné comme des plans d'ingénieur.

- **Générateur** : [Astro](https://astro.build) (site statique, aucun serveur applicatif).
- **Contenu** : un fichier Markdown par projet dans `src/content/projets/`.
- **Dessins** : composants SVG dans `src/components/figures/`.
- **Hébergement** : fichiers statiques servis par Caddy sur le VPS (`dist/`).

## Commandes

```sh
npm ci            # installer (Node 22.12+)
npm run dev       # serveur de développement, http://localhost:4321
npm run build     # génère dist/
npm run preview   # sert dist/ pour vérification
npm run check     # vérification TypeScript / Astro
```

## Ajouter un projet

1. Créer `src/content/projets/<slug>.md` en copiant un fichier existant.
2. Remplir l'en-tête (le schéma est dans `src/content.config.ts`) : `titre`, `accroche`, `categorie`, `statut`, `periode`, `debut`, `repere`, `matieres`, `liens`, `collaboration`…
3. Choisir le numéro de `repere` : il fixe l'ordre dans la nomenclature et le numéro de planche.
4. Facultatif : `vedette: true` pour l'afficher sur la page d'accueil, `figure: <nom>` pour un dessin (voir `src/components/Figure.astro`).
5. `npm run build` ; le déploiement suit (voir `scripts/deploy-vps.sh`).

Les photos iront dans `public/photos/<slug>/` ; un composant d'affichage sera ajouté quand les premières photos seront là.

## Ajouter un dessin

Créer `src/components/figures/<Nom>.astro` sur le modèle de `Cumulus.astro` (viewBox `0 0 220 150`, classes de traits de `global.css`, repères avec `Bulle`, cotes avec `Cote`), puis l'inscrire dans la table de `src/components/Figure.astro`. Les repères numérotés doivent correspondre à la liste `reperes` du fichier Markdown.

## Déploiement

`scripts/deploy-vps.sh` tire la branche `main`, reconstruit et remplace `dist/` de façon atomique. Un minuteur systemd (voir `scripts/systemd/`) l'exécute toutes les cinq minutes ; il ne reconstruit que si un nouveau commit est arrivé.

## Polices

- Anybody (titres) et Atkinson Hyperlegible (texte), via `@fontsource`, licence OFL.
- osifont (cotes, lettrage ISO 3098), `public/fonts/`, LGPL 3 avec exception « font ».
