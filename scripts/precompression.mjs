// Intégration Astro : à la fin du build, chaque fichier texte de dist/ reçoit un jumeau .br et .gz.
// Caddy les sert tels quels (`file_server { precompressed br gzip }`, voir scripts/Caddyfile.laulab) :
// plus de compression à chaque requête, et brotli compresse mieux que le gzip à la volée. Sans la
// directive, les jumeaux sont simplement ignorés. Le modèle 3D de l'atelier (4,6 Mo de JSON) est le
// premier bénéficiaire.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { brotliCompress, gzip, constants } from 'node:zlib';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const brotli = promisify(brotliCompress);
const gz = promisify(gzip);

/** Types servis compressés ; les polices, images, PDF et tableurs sont déjà compressés */
const EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt', '.webmanifest', '.ico']);
const TAILLE_MIN = 1024;
const EN_PARALLELE = 4;

async function* fichiers(dossier) {
  for (const e of await readdir(dossier, { withFileTypes: true })) {
    const chemin = path.join(dossier, e.name);
    if (e.isDirectory()) yield* fichiers(chemin);
    else if (EXTENSIONS.has(path.extname(e.name))) yield chemin;
  }
}

async function compresser(chemin) {
  const donnees = await readFile(chemin);
  const [br, g] = await Promise.all([
    brotli(donnees, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: donnees.length,
        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT
      }
    }),
    gz(donnees, { level: 9 })
  ]);
  await Promise.all([writeFile(chemin + '.br', br), writeFile(chemin + '.gz', g)]);
  return { avant: donnees.length, br: br.length, gz: g.length };
}

/** @returns {import('astro').AstroIntegration} */
export default function precompression() {
  return {
    name: 'laulab-precompression',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const racine = fileURLToPath(dir);
        const debut = Date.now();
        const liste = [];
        for await (const f of fichiers(racine)) if ((await stat(f)).size >= TAILLE_MIN) liste.push(f);
        let n = 0;
        const bilan = { avant: 0, br: 0, gz: 0 };
        const travailleur = async () => {
          for (let f = liste.shift(); f; f = liste.shift()) {
            const r = await compresser(f);
            bilan.avant += r.avant;
            bilan.br += r.br;
            bilan.gz += r.gz;
            n++;
          }
        };
        await Promise.all(Array.from({ length: EN_PARALLELE }, travailleur));
        const mo = (o) => (o / 1048576).toFixed(1) + ' Mo';
        logger.info(`${n} fichiers précompressés en ${((Date.now() - debut) / 1000).toFixed(1)} s : ${mo(bilan.avant)} → ${mo(bilan.br)} (br), ${mo(bilan.gz)} (gz)`);
      }
    }
  };
}
