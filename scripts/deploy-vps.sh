#!/usr/bin/env bash
# Déploiement de laulab.feroux.fr sur le VPS.
# - Tire la branche main ; ne fait rien si aucun nouveau commit.
# - Reconstruit dans un dossier temporaire puis remplace dist/ d'un coup.
# Usage : scripts/deploy-vps.sh [--force]
set -euo pipefail

DEPOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DEPOT"

export PATH="$DEPOT/node_modules/.bin:$PATH"

git fetch --quiet origin main
LOCAL="$(git rev-parse HEAD)"
DISTANT="$(git rev-parse origin/main)"

if [[ "$LOCAL" == "$DISTANT" && -d dist && "${1:-}" != "--force" ]]; then
  echo "laulab : déjà à jour ($LOCAL)"
  exit 0
fi

echo "laulab : $LOCAL → $DISTANT"
git reset --hard --quiet origin/main

# Dépendances : seulement si le lockfile a changé ou si node_modules manque
if [[ ! -d node_modules || package-lock.json -nt node_modules/.package-lock.json ]]; then
  npm ci --no-audit --no-fund --loglevel=error
fi

rm -rf .dist-next
npx astro build --outDir .dist-next
rm -rf .dist-prev
[[ -d dist ]] && mv dist .dist-prev
mv .dist-next dist
rm -rf .dist-prev

echo "laulab : déployé $(git rev-parse --short HEAD) à $(date -Is)"
