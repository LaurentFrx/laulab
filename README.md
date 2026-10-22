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
npm run atelier   # réimporte l'Atelier Jansenosaure depuis GitHub (voir plus bas)
```

Le premier `build`, `dev` ou `check` clone l'Atelier Jansenosaure dans `.cache/` (Git requis).

## Ajouter un projet

1. Créer `src/content/projets/<slug>.md` en copiant un fichier existant.
2. Remplir l'en-tête (le schéma est dans `src/content.config.ts`) : `titre`, `accroche`, `categorie`, `statut`, `periode`, `debut`, `repere`, `matieres`, `liens`, `collaboration`…
3. Choisir le numéro de `repere` : il fixe l'ordre dans la nomenclature et le numéro de planche.
4. Facultatif : `vedette: true` pour l'afficher sur la page d'accueil, `figure: <nom>` pour un dessin (voir `src/components/Figure.astro`).
5. `npm run build` ; le déploiement suit (voir `scripts/deploy-vps.sh`).

Les photos iront dans `public/photos/<slug>/` ; un composant d'affichage sera ajouté quand les premières photos seront là.

## Ajouter un dessin

Créer `src/components/figures/<Nom>.astro` sur le modèle de `Cumulus.astro` (viewBox `0 0 220 150`, classes de traits de `global.css`, repères avec `Bulle`, cotes avec `Cote`), puis l'inscrire dans la table de `src/components/Figure.astro`. Les repères numérotés doivent correspondre à la liste `reperes` du fichier Markdown.

## Atelier Jansenosaure

Les pages `/projets/jansenosaure/atelier/` reprennent l'atelier du robot : une page unique produite par `GENERER.cmd` (sur le PC, dans Nextcloud) et poussée dans le dépôt public [LaurentFrx/atelier-jansenosaure](https://github.com/LaurentFrx/atelier-jansenosaure). Le site n'en garde aucune copie : à chaque construction, `scripts/atelier/importer.mjs` la découpe (un onglet par page, modèle 3D et fichiers servis à part, styles confinés et habillés au plan) dans `src/atelier/genere/`, hors Git.

- Nouvelle version de l'atelier poussée sur GitHub → en ligne au plus 5 minutes plus tard, sans commit dans ce dépôt.
- Structure de l'atelier changée au point que l'import ne la comprend plus → la construction échoue avec un message clair, et le site en ligne reste tel quel. Il faut alors adapter l'import.
- three.js est épinglé sur la version que charge l'atelier (r128) ; si l'atelier en change, l'import le dit et indique la commande.
- Dans le site, l'atelier reste un seul document : on passe d'une feuille à l'autre sans rechargement, la 3D (chargée à la première feuille « Voir », avec un pourcentage) reste vivante d'une feuille à l'autre, se libère quand on quitte l'atelier, et peut passer en plein écran.
- Le build écrit un jumeau `.br` et `.gz` de chaque fichier texte de `dist/` (le modèle 3D passe de 4,6 Mo à 0,3 Mo) ; Caddy les sert avec `file_server { precompressed br gzip }` (voir `scripts/Caddyfile.laulab`).

## Déploiement

`scripts/deploy-vps.sh` suit la branche `main` de ce dépôt et celle de l'atelier, reconstruit si l'une a changé et remplace `dist/` de façon atomique. Un minuteur systemd (voir `scripts/systemd/`) l'exécute toutes les cinq minutes. Une version qui échoue à la construction n'est pas retentée : le commit suivant, sur l'un ou l'autre dépôt, relance.

## Polices

- Anybody (titres) et Atkinson Hyperlegible (texte), via `@fontsource`, licence OFL.
- osifont (cotes, lettrage ISO 3098), `public/fonts/`, LGPL 3 avec exception « font ».
