// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import atelier from './scripts/atelier/integration.mjs';
import precompression from './scripts/precompression.mjs';

export default defineConfig({
  site: 'https://laulab.feroux.fr',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  // atelier() importe l'Atelier Jansenosaure (scripts/atelier/) avant la construction ;
  // precompression() écrit les jumeaux .br/.gz après (servis par Caddy, `precompressed`)
  integrations: [atelier(), sitemap(), precompression()],
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    // three.js (élagué) et le visualiseur de l'atelier : ~520 Ko en un morceau, chargé par la seule feuille « Voir »
    build: { chunkSizeWarningLimit: 600 }
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
