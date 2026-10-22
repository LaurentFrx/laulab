#!/usr/bin/env bash
# Déploiement de laulab.feroux.fr sur le VPS (lancé toutes les 5 min par laulab-deploy.timer).
# - Suit deux dépôts : ce site (branche main) et l'Atelier Jansenosaure (LaurentFrx/atelier-jansenosaure,
#   main, souvent réécrite d'un seul commit : on la suit par fetch + reset, jamais par pull).
# - Reconstruit si l'un des deux a changé, dans un dossier temporaire, puis remplace dist/ d'un coup.
# - Si la construction échoue (atelier dont la structure n'est plus comprise, par exemple) : le site en
#   ligne ne bouge pas, l'échec est noté et la même version n'est pas retentée ; le commit suivant,
#   sur l'un ou l'autre dépôt, relance une construction.
# Usage : scripts/deploy-vps.sh [--force]
#
# Tout est dans une fonction : bash la lit en entier avant de l'exécuter, si bien que le
# `git reset` ci-dessous peut remplacer ce fichier sans perturber l'exécution en cours.
set -euo pipefail

deployer() {
  local DEPOT ETAT ATELIER_URL ATELIER_DIR FORCE
  DEPOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  ETAT="${LAULAB_ETAT:-/var/lib/laulab}"            # HOME de l'utilisateur laulab, inscriptible (ReadWritePaths)
  ATELIER_URL="${ATELIER_DEPOT:-https://github.com/LaurentFrx/atelier-jansenosaure.git}"   # surcharge : essais
  ATELIER_DIR="$ETAT/atelier-jansenosaure"
  FORCE="${1:-}"
  cd "$DEPOT"
  export PATH="$DEPOT/node_modules/.bin:$PATH"

  # --- état des deux dépôts
  git fetch --quiet origin main
  local LOCAL DISTANT
  LOCAL="$(git rev-parse HEAD)"
  DISTANT="$(git rev-parse origin/main)"

  if [[ ! -d "$ATELIER_DIR/.git" ]]; then
    git clone --quiet --depth 1 --branch main "$ATELIER_URL" "$ATELIER_DIR"
  fi
  git -C "$ATELIER_DIR" fetch --quiet --depth 1 origin main
  local ATELIER
  ATELIER="$(git -C "$ATELIER_DIR" rev-parse FETCH_HEAD)"

  local SIGNATURE DEPLOYE ECHEC
  SIGNATURE="site=$DISTANT atelier=$ATELIER"
  DEPLOYE="$(cat "$ETAT/laulab-deploye" 2>/dev/null || true)"
  ECHEC="$(cat "$ETAT/laulab-echec" 2>/dev/null || true)"

  # (Sans état noté — premier passage de ce script — la signature diffère : on construit.)
  if [[ "$FORCE" != "--force" && -d dist ]]; then
    if [[ "$SIGNATURE" == "$DEPLOYE" ]]; then
      echo "laulab : à jour (site ${DISTANT:0:7}, atelier ${ATELIER:0:7})"
      return 0
    fi
    if [[ "$SIGNATURE" == "$ECHEC" ]]; then
      echo "laulab : cette version a déjà échoué à la construction (site ${DISTANT:0:7}, atelier ${ATELIER:0:7}) ; le site en ligne est inchangé, en attente d'un nouveau commit" >&2
      return 0
    fi
  fi

  echo "laulab : site ${LOCAL:0:7} → ${DISTANT:0:7}, atelier → ${ATELIER:0:7}"
  [[ "$LOCAL" != "$DISTANT" ]] && git reset --hard --quiet origin/main
  git -C "$ATELIER_DIR" reset --hard --quiet FETCH_HEAD

  # Dépendances : seulement si le lockfile a changé ou si node_modules manque
  if [[ ! -d node_modules || package-lock.json -nt node_modules/.package-lock.json ]]; then
    npm ci --no-audit --no-fund --loglevel=error
  fi

  rm -rf .dist-next
  if ! ATELIER_SOURCE="$ATELIER_DIR/index.html" npx astro build --outDir .dist-next; then
    rm -rf .dist-next
    echo "$SIGNATURE" > "$ETAT/laulab-echec"
    echo "laulab : ÉCHEC de la construction (site ${DISTANT:0:7}, atelier ${ATELIER:0:7}) ; le site en ligne est inchangé" >&2
    return 1
  fi
  rm -rf .dist-prev
  [[ -d dist ]] && mv dist .dist-prev
  mv .dist-next dist
  rm -rf .dist-prev

  echo "$SIGNATURE" > "$ETAT/laulab-deploye"
  rm -f "$ETAT/laulab-echec"
  echo "laulab : déployé site $(git rev-parse --short HEAD), atelier ${ATELIER:0:7}, à $(date -Is)"
}

deployer "$@"; exit $?
