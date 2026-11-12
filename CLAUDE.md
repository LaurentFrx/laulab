# L@uL@b — consignes pour Claude Code

Site statique Astro 7 (`output: 'static'`, `trailingSlash: 'always'`). Français partout : code commenté en français, noms de variables en français quand ils désignent le domaine (planche, repère, cartouche, matières).

## Ce qu'il faut savoir

- Astro 7 : compilateur Rust strict (balises bien fermées, pas de `<div>` dans `<p>`), `z` vient de `astro/zod`, `render(entry)` vient de `astro:content`, Markdown traité par Sätteri (pas de plugins remark/rehype installés).
- Les scripts clients (`<script>` dans les composants) doivent écouter `astro:page-load` : le site utilise `<ClientRouter />` (transitions de pages), un script module ne s'exécute qu'une fois.
- Les props numériques passées aux composants SVG (`Cote`, `Bulle`) arrivent en chaînes : elles sont converties avec `Number()`.
- Pas de dépendance réseau au chargement : polices auto-hébergées, aucun CDN, aucun suivi.
- Thème : `data-theme="cyanotype"` (défaut) ou `"calque"` sur `<html>`, mémorisé dans `localStorage` (`laulab-theme`). Toutes les couleurs sont des variables dans `src/styles/global.css`.
- La scène 3D de l'accueil n'utilise aucune bibliothèque : projection maison sur Canvas 2D (`projection.ts`), géométrie en segments (`marcheur.ts`). Les couleurs du canvas sont lues dans les variables CSS, donc le thème s'applique. `prefers-reduced-motion` coupe tout et affiche la figure SVG.

## Où est quoi

| Chemin | Rôle |
| --- | --- |
| `src/content/projets/*.md` | Un projet par fichier, schéma dans `src/content.config.ts` |
| `src/lib/nomenclature.ts` | Catégories, statuts, tri, numéros de planche |
| `src/lib/jansen.ts` | Cinématique du mécanisme de Jansen (nombres de Theo Jansen) |
| `src/lib/marcheur.ts` | Le Jansenosaure complet en segments 3D : 4 pattes phasées, châssis, vilebrequin, trajectoires |
| `src/lib/projection.ts` | Caméra en orbite, projection perspective, bruit fractal, images-clés |
| `src/lib/verre.ts` | Logo LF en verre : la vidéo à fond blanc est détourée image par image dans un canvas (Safari n'applique pas `mix-blend-mode` aux vidéos) |
| `src/lib/son.ts` | Pas synthétisés en Web Audio, sans fichier ; jamais sans clic |
| `src/components/Scene.astro` | Scène d'accueil : canvas 2D collant, chapitres au défilement, étiquettes projetées, repli SVG |
| `src/components/figures/` | Dessins SVG ; `Figure.astro` fait l'aiguillage par nom |
| `src/components/Cartouche.astro` | Bloc d'identification en pied de page |
| `src/components/Film.astro`, `src/components/films/` | Film de montage d'un projet (`film: <nom>` dans son Markdown) : il remplace l'en-tête de la planche. `Film.astro` fait l'aiguillage par nom ; sans film, la planche garde son en-tête ordinaire |
| `src/lib/chevalet.ts` | Le chevalet d'aquarelle en volumes : faces planes posées selon l'étape (`poser()`), cinématique de la planchette et de la pente |
| `src/components/Liasse.astro` | Jeu de plans en volume (CSS 3D) : navigation entre planches, en bas de chaque planche et en tête de la nomenclature. La pose des feuilles est calculée en CSS depuis `--k` (rang) et `--pos` (position) ; le script n'écrit que `--pos`. Pose `data-tourne` sur `<html>` pour la transition « tourner la planche » (fin de `global.css`) |
| `src/components/Dock.astro` | Barre de navigation du téléphone (≤ 640 px), fixe en bas : Accueil, planche précédente, Jeu de plans, planche suivante. Rendue par le gabarit `Planche.astro` sur toutes les pages ; sa hauteur est dans `--dock` (ce qui est collé en bas remonte d'autant) |
| `src/components/JeuDePlans.astro` | Jeu de plans en plein écran (`<dialog>`), ouvert par tout élément `[data-jeu-de-plans]` (barre, en-tête). Il emprunte la liasse de la page et la remet à sa place en fermant |
| `src/lib/tourne.ts` | `tourner(sens)` : pose `data-tourne` pour la transition « tourner la planche », le repose après l'échange de page, l'oublie ensuite |
| `src/components/Tirage.astro`, `PlancheContact.astro`, `Visionneuse.astro` | Photos d'un projet : tirage qui se développe, planche contact en fin de planche, agrandissement au clic |
| `src/layouts/Planche.astro` | Gabarit commun (cadre, en-tête, `<head>`) |
| `scripts/icones/` | Logo LF source (`logo-lf.png`) et `generer.py` (Pillow) : favicon, icônes Android/iOS dans `public/` ; si le logo change, changer aussi le nom des fichiers (iOS garde ses icônes en cache par adresse) |
| `scripts/deploy-vps.sh` | Déploiement sur le VPS : suit ce dépôt **et** le dépôt de l'atelier, build, remplacement atomique de `dist/` |
| `scripts/atelier/importer.mjs` | Import de l'Atelier Jansenosaure (page unique de LaurentFrx/atelier-jansenosaure) vers `src/atelier/genere/` ; lancé par l'intégration `integration.mjs` à chaque build/dev/check |
| `scripts/atelier/css.mjs` | Confine les styles de l'atelier sous `.atelier` (préfixe, retire `:root`/`html`/`body`) |
| `src/atelier/` | `atelier.ts` (sommaire, contenu des onglets, adresses des fichiers — côté build seulement), `atelier.css` (jetons `--at-*` pris dans ceux du site), `habillage.ts` (palette, arêtes, lumière, cadrage, plein écran, libération de la 3D), `demarrer.ts` (cycle de vie : chargement en flux, persistance entre feuilles, arrêt en quittant l'atelier) |
| `src/layouts/Atelier.astro`, `src/pages/projets/jansenosaure/atelier/[...feuille].astro` | Une page par onglet de l'atelier ; la section « Voir » (la 3D) est sur chaque feuille, `transition:persist`, cachée hors de « Voir » |
| `scripts/precompression.mjs` | Après le build, jumeaux `.br` et `.gz` de chaque fichier texte de `dist/` (Caddy `precompressed`) |

## Films et photos

- Le texte d'un film vient du Markdown du projet : `etapes` (titre, texte, nom de la vue, photos) et `photos` (id, src, alt, légende, dimensions). Le composant du film ne porte que la mise en scène : poses, caméra, cotes, étiquettes. Le film du chevalet est calé sur six étapes dans un ordre précis (poche, tubes, planchette, finition, inclinaison, feuille) ; en changer l'ordre demande de reprendre ses pistes (`PISTES`).
- Les pistes d'un film sont indexées par le chapitre affiché (0 = titre, 1…n = étapes) : entre deux entiers, on passe d'une étape à la suivante. Ce qui ne dépend pas du défilement (vernis, lavis, aimants) est animé dans le temps.
- Ordre de dessin : les pièces sont rangées de part et d'autre du plateau (derrière lui ou devant, selon que la caméra voit son dessus ou son dessous), puis par distance ; les petites pièces plaquées sur une face (charnières, aimants) sont ses « pastilles », dessinées juste après elle.
- Photos : `public/photos/<slug>/NN-nom.jpg` (1600 px au plus, métadonnées retirées) et sa réduction `NN-nom-800.jpg` à côté, que `Tirage.astro` déduit du nom. Recette : `ffmpeg -i source -map_metadata -1 -vf "scale='min(1600,iw)':-2:flags=lanczos" -q:v 4 NN-nom.jpg`, puis la même avec 800 et `-q:v 5`.
- L'état « pas encore apparu » des titres et des tirages n'est posé que si un script en ligne a marqué la section (`data-pret`) : sans script ou avec moins d'animations, tout est visible d'emblée.

## Liasse et transitions de page

- **Safari** n'applique pas la `perspective` d'un grand-parent à travers un conteneur `preserve-3d` intermédiaire : toute la liasse s'affichait à plat, feuilles en désordre (publié ainsi le 12/11/2026, vu par Laurent). La perspective est donc sur le parent direct des feuilles, sans `preserve-3d`, et l'ordre d'empilement vient de `z-index` (CSS au départ, script ensuite). Ne pas revenir à un espace 3D partagé.
- **Toujours essayer dans le moteur de Safari avant de publier** : Laurent consulte le site sur appareils Apple. WebKit est installé avec le Playwright de `~/.npm/_npx/e41f203b7505f1fb/node_modules/playwright` (`webkit.launch()`, profils `devices['iPhone 15']`, `devices['iPad (gen 7)']`) ; celui de `~/tazieff-eps` n'a que Chromium.
- `pointer-events: none` sur la liste et `auto` sur les feuilles : ailleurs que sur une feuille, le geste va à la scène.
- **Une seule liasse par page** : elle pèse environ 76 Ko de HTML (les dessins SVG des vingt feuilles). Le plein écran l'emprunte au lieu d'en porter une seconde. Une page sans liasse garde un lien ordinaire vers la nomenclature.
- Un écouteur de clic qui doit passer avant le routeur d'Astro (ouvrir le plein écran au lieu de suivre le lien, poser le sens de la page qui tourne) s'inscrit **en phase de capture** : le routeur écoute `document` en premier et appelle `preventDefault`.
- Le site est installable (`manifest.json`, `display: standalone`) et Laurent l'utilise ainsi sur iPhone : pas de bouton « retour ». Sous 640 px l'en-tête ne colle pas ; la barre du bas est donc le seul retour vers l'accueil.
- Le WebKit de Playwright sous Linux ne dessine pas la propriété `perspective` (rendu logiciel) : il sert à vérifier les parcours, les erreurs et la mise en page dans Safari, pas l'effet 3D.
- Un composant initialisé sur `astro:page-load` l'est deux fois au premier chargement (au chargement du module, puis à l'évènement) : l'instance arrêtée doit détacher ses écouteurs (`AbortController`), sinon elle répond encore aux clics avec un état périmé.
- `data-tourne` (suivant, precedent, ouvrir) : l'échange de page d'Astro remet les attributs de `<html>` à neuf, sauf ceux en `data-astro-*` ; la liasse le repose donc sur `astro:after-swap` et l'enlève quand la transition est finie.
- Pour vérifier une interaction, la filmer avec Playwright (celui de `~/tazieff-eps/node_modules`, Chromium déjà installé) et tracer les évènements : une capture d'écran fixe ne montre ni un clic perdu ni une page qui ne tourne pas.

## Serveur (VPS tazieff-dev)

- Le clone vit dans `/srv/laulab` (propriétaire `laulab`, utilisateur système dédié sans shell ni sudo, groupe `caddy`) ; Caddy sert `/srv/laulab/dist`. Le HOME et le cache npm de `laulab` sont dans `/var/lib/laulab`.
- `laulab-deploy.timer` (systemd) lance `scripts/deploy-vps.sh` toutes les 5 minutes : `git reset --hard origin/main`, `npm ci` si le lockfile a changé, build dans `.dist-next`, puis remplacement de `dist/`. **Toute modification faite à la main dans `/srv/laulab` est écrasée** : on passe par un commit sur `main`.
- Le script suit aussi l'atelier : clone superficiel dans `/var/lib/laulab/atelier-jansenosaure` (fetch + reset, la branche y est réécrite), passé au build par `ATELIER_SOURCE`. Il reconstruit si l'un des deux dépôts a changé. État dans `/var/lib/laulab/laulab-deploye` (dernière version en ligne) et `laulab-echec` (version qui a échoué, pas retentée) ; `--force` passe outre. Journal : `journalctl -u laulab-deploy`.
- Caddy : `scripts/Caddyfile.laulab` est une référence, `/etc/caddy/Caddyfile` fait foi (il garde en plus la directive `log` du serveur). Avant un `systemctl reload caddy`, valider sous l'utilisateur `caddy` : `sudo -u caddy caddy validate --config /etc/caddy/Caddyfile`. Ne pas renommer le journal existant. Sauvegarde datée du Caddyfile avant toute modification.
- Sécurité : qui peut pousser sur `main` fait tourner `npm ci` et le build sur le VPS, sous `laulab` (unité systemd durcie : NoNewPrivileges, ProtectSystem=strict…). Ne jamais ajouter de dépendance sans la vérifier ; le lockfile est engagé.
- La copie de travail est un clone sur le PC ou Claude Code en ligne, jamais `/srv/laulab`.

## Atelier Jansenosaure

- `src/atelier/genere/` est **généré, hors Git** : ne jamais le modifier ni le versionner. La source vient de `ATELIER_SOURCE` (posé par `deploy-vps.sh`) ou du clone `.cache/atelier-jansenosaure` (créé au premier build ; `npm run atelier` le met à jour).
- Le visualiseur 3D de l'atelier est repris tel quel, avec trois raccords posés par l'import et marqués `[site]` : `window.__atelierMatieres(MAT)`, `window.__atelierSurligne`, l'évènement `atelier:pret`. Un raccord qui ne trouve plus son point d'ancrage donne un avertissement, pas une erreur : la 3D garde alors ses couleurs d'origine.
- Erreurs bloquantes (le build échoue, le VPS garde l'ancien site) : onglets ou sections introuvables, données du modèle absentes ou illisibles, visualiseur qui ne lit plus `#donnees`, version de three.js différente de celle du site (`three` est épinglé à 0.128.0, la version que charge l'atelier).
- Les jetons de l'atelier (`--papier`, `--encre`…) entrent en collision avec ceux du site : l'import les renomme `--at-*` partout (CSS, HTML, visualiseur). Les couleurs de la scène (`--at-sol`, `--at-grille`) sont des valeurs linéaires (three r128 sans gestion des couleurs).
- Les figures techniques (plateaux de découpe, schémas des études) gardent un papier clair dans les deux thèmes : leurs textes nomment leurs couleurs.
- L'atelier est un document vivant : les feuilles s'enchaînent par le `ClientRouter`, et `#voir` (la 3D) est persisté d'une page à l'autre. `demarrer.ts` démarre la 3D à la première feuille « Voir » affichée, la met en veille (`data-actif="0"`) sur les autres feuilles, la libère (`habillage.arreter()` : géométries, contexte WebGL, boucle) quand on quitte l'atelier, et la relance au retour. `atelier.ts` ne doit jamais être importé côté client (il embarque tous les fragments HTML).
- Le visualiseur reçoit three.js par imports nommés générés (élagage) ; `EXTRAS_THREE_SITE` dans l'import liste les classes que l'habillage ajoute.

## Vérifier avant de livrer

```sh
npm run check && npm run build
```

Puis regarder le rendu : `npm run preview` et ouvrir la page concernée. Les figures doivent rester lisibles en vignette (classe `.vignette` : cotes et bulles masquées) et en mode `calque`.

## Ne pas faire

- Ne pas ajouter Tailwind ni de framework d'interface : le CSS est volontairement écrit à la main.
- Ne pas remplacer les SVG écrits à la main par des images.
- Ne pas inventer de faits sur les projets : si une information manque dans le Markdown, la demander à Laurent.
