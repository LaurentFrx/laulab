// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import atelier from './scripts/atelier/integration.mjs';

export default defineConfig({
  site: 'https://laulab.feroux.fr',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  // atelier() importe l'Atelier Jansenosaure (scripts/atelier/) avant la construction
  integrations: [atelier(), sitemap()],
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    // three.js r128 (vue 3D de l'atelier) fait ~590 Ko en un seul morceau, chargé par la seule page « Voir »
    build: { chunkSizeWarningLimit: 700 }
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
