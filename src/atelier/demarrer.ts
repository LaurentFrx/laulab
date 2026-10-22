/**
 * Démarrage de la vue 3D de l'atelier (feuille « Voir »).
 *
 * Trois choses arrivent en parallèle, toutes servies par le site (aucune dépendance réseau) :
 * three.js r128, le visualiseur de l'atelier, et le modèle (donnees.json, ~4,6 Mo, ~1 Mo compressé,
 * en cache long). Le visualiseur lit le modèle dans un <script id="donnees">, comme dans la page
 * d'origine : on le lui pose avant de le lancer.
 *
 * La page « Voir » n'utilise pas les transitions de pages du site : chaque visite est un vrai
 * chargement, le visualiseur ne tourne donc jamais deux fois dans le même document.
 */
import donneesUrl from './genere/donnees.json?url';
import { preparerHabillage } from './habillage';

async function demarrer() {
  if (!document.getElementById('scene') || document.getElementById('donnees')) return;
  preparerHabillage();
  try {
    const reponse = fetch(donneesUrl);
    const [THREE, visualiseur, r] = await Promise.all([import('three'), import('./genere/visualiseur'), reponse]);
    if (!r.ok) throw new Error(`modèle 3D : réponse ${r.status}`);
    const texte = await r.text();
    const noeud = document.createElement('script');
    noeud.type = 'application/json';
    noeud.id = 'donnees';
    noeud.textContent = texte;
    document.body.append(noeud);
    visualiseur.default(THREE);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    if (window.__panne) {
      window.__panne("La vue 3D n'a pas pu se charger. Les autres feuilles de l'atelier restent lisibles.", detail);
    } else {
      console.error('atelier :', e);
    }
  }
}

demarrer();
