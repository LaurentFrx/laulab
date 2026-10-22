// Intégration Astro : importe l'atelier avant que le site ne soit construit (build, dev, check).
// La source vient de ATELIER_SOURCE (posé par scripts/deploy-vps.sh) ou du clone en cache .cache/.
import { fileURLToPath } from 'node:url';
import { importerAtelier } from './importer.mjs';

/** @returns {import('astro').AstroIntegration} */
export default function atelier() {
  return {
    name: 'laulab-atelier',
    hooks: {
      'astro:config:setup': async ({ config, logger }) => {
        await importerAtelier({
          racine: fileURLToPath(config.root),
          journal: { info: (m) => logger.info(m), warn: (m) => logger.warn(m) }
        });
      }
    }
  };
}
