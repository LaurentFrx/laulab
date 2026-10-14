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
| `src/lib/son.ts` | Pas synthétisés en Web Audio, sans fichier ; jamais sans clic |
| `src/components/Scene.astro` | Scène d'accueil : canvas 2D collant, chapitres au défilement, étiquettes projetées, repli SVG |
| `src/components/figures/` | Dessins SVG ; `Figure.astro` fait l'aiguillage par nom |
| `src/components/Cartouche.astro` | Bloc d'identification en pied de page |
| `src/layouts/Planche.astro` | Gabarit commun (cadre, en-tête, `<head>`) |
| `scripts/deploy-vps.sh` | Déploiement sur le VPS (git pull, build, remplacement atomique de `dist/`) |

## Serveur (VPS tazieff-dev)

- Le clone vit dans `/srv/laulab` (propriétaire `laulab`, utilisateur système dédié sans shell ni sudo, groupe `caddy`) ; Caddy sert `/srv/laulab/dist`. Le HOME et le cache npm de `laulab` sont dans `/var/lib/laulab`.
- `laulab-deploy.timer` (systemd) lance `scripts/deploy-vps.sh` toutes les 5 minutes : `git reset --hard origin/main`, `npm ci` si le lockfile a changé, build dans `.dist-next`, puis remplacement de `dist/`. **Toute modification faite à la main dans `/srv/laulab` est écrasée** : on passe par un commit sur `main`.
- Caddy : `scripts/Caddyfile.laulab` est une référence, `/etc/caddy/Caddyfile` fait foi (il garde en plus la directive `log` du serveur). Avant un `systemctl reload caddy`, valider sous l'utilisateur `caddy` : `sudo -u caddy caddy validate --config /etc/caddy/Caddyfile`. Ne pas renommer le journal existant. Sauvegarde datée du Caddyfile avant toute modification.
- Sécurité : qui peut pousser sur `main` fait tourner `npm ci` et le build sur le VPS, sous `laulab` (unité systemd durcie : NoNewPrivileges, ProtectSystem=strict…). Ne jamais ajouter de dépendance sans la vérifier ; le lockfile est engagé.
- La copie de travail est un clone sur le PC ou Claude Code en ligne, jamais `/srv/laulab`.

## Vérifier avant de livrer

```sh
npm run check && npm run build
```

Puis regarder le rendu : `npm run preview` et ouvrir la page concernée. Les figures doivent rester lisibles en vignette (classe `.vignette` : cotes et bulles masquées) et en mode `calque`.

## Ne pas faire

- Ne pas ajouter Tailwind ni de framework d'interface : le CSS est volontairement écrit à la main.
- Ne pas remplacer les SVG écrits à la main par des images.
- Ne pas inventer de faits sur les projets : si une information manque dans le Markdown, la demander à Laurent.
