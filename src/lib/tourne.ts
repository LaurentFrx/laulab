/**
 * Tourner la planche : en passant d'une planche à une autre, la page entière pivote comme une
 * feuille de classeur (les animations sont à la fin de global.css).
 * Le sens est posé sur <html> (data-tourne) le temps d'une navigation : suivant, precedent
 * (dans l'ordre des planches) ou ouvrir (depuis ailleurs).
 */
export type Sens = 'suivant' | 'precedent' | 'ouvrir';

let sens = '';
let installe = false;
let garde = 0;

function oublier() {
  sens = '';
  window.clearTimeout(garde);
  delete document.documentElement.dataset.tourne;
}

function installer() {
  if (installe) return;
  installe = true;
  document.addEventListener('astro:before-swap', (ev) => {
    if (!sens) return;
    window.clearTimeout(garde);
    // La transition finie, on oublie le sens : la navigation suivante reprend le fondu ordinaire
    const transition = (ev as Event & { viewTransition?: { finished?: Promise<unknown> } }).viewTransition;
    if (transition?.finished) transition.finished.then(oublier, oublier);
    else window.setTimeout(oublier, 1200);
  });
  // L'échange de page remet les attributs de <html> à neuf : on y repose le sens avant que la transition ne s'anime
  document.addEventListener('astro:after-swap', () => {
    if (sens) document.documentElement.dataset.tourne = sens;
  });
}

/** À appeler au clic qui déclenche la navigation, avant qu'elle ne parte. */
export function tourner(s: Sens) {
  installer();
  sens = s;
  document.documentElement.dataset.tourne = s;
  // Si la navigation n'a pas lieu (lien ouvert ailleurs, erreur), le sens ne reste pas en attente
  window.clearTimeout(garde);
  garde = window.setTimeout(oublier, 4000);
}
