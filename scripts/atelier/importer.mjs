// Import de l'Atelier Jansenosaure dans le site.
//
// L'atelier est une page unique (index.html, ~7 Mo) produite par GENERER.cmd sur le PC de Laurent et
// poussée dans le dépôt public LaurentFrx/atelier-jansenosaure. Ce script la découpe en morceaux que
// le site sait servir et habiller :
//
//   src/atelier/genere/sommaire.json      titre, onglets, version source, fichiers, empreinte
//   src/atelier/genere/onglets/<id>.html  le contenu de chaque onglet (une page du site par onglet)
//   src/atelier/genere/atelier.css        la feuille de style de l'atelier, confinée sous .atelier
//   src/atelier/genere/donnees.json       le modèle 3D et les poses de la marche (servi à part, en cache long)
//   src/atelier/genere/visualiseur.ts     le visualiseur 3D, enveloppé en module (three.js fourni par le site)
//   src/atelier/genere/panne.js           l'affichage des pannes de la vue 3D
//   src/atelier/genere/fichiers/*         les fichiers embarqués en data: (PDF, tableur…)
//
// Rien de ce dossier n'est versionné : il est refait à chaque build (voir integration.mjs).
// Le script refuse une source dont la structure a changé au point de ne plus être comprise :
// le build échoue, et sur le VPS l'ancien site reste en ligne.
//
// Ligne de commande :
//   node scripts/atelier/importer.mjs            importe depuis ATELIER_SOURCE ou le cache .cache/
//   node scripts/atelier/importer.mjs --maj      met d'abord le cache à jour depuis GitHub
//   node scripts/atelier/importer.mjs --source chemin/index.html

import { readFile, writeFile, mkdir, rm, rename } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { confiner, jetonsRacine } from './css.mjs';

export const DEPOT_ATELIER = 'https://github.com/LaurentFrx/atelier-jansenosaure.git';
export const PAGE_DEPOT = 'https://github.com/LaurentFrx/atelier-jansenosaure';
/** Adresse des pages de l'atelier dans le site (l'onglet « voir » est la page d'entrée) */
export const BASE_ATELIER = '/projets/jansenosaure/atelier/';

const PORTEE = '.atelier';
const ICI = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------- outils

const sha256 = (x) => createHash('sha256').update(x).digest('hex');

function git(dir, ...args) {
  return execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

/** Position de la balise fermante qui équilibre la balise ouvrante trouvée en `debut`. */
function finDeBalise(html, debut, nom) {
  const re = new RegExp(`<(/?)${nom}\\b[^>]*>`, 'gi');
  re.lastIndex = debut;
  let profondeur = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      profondeur--;
      if (profondeur === 0) return { interieur: html.indexOf('>', debut) + 1, fermante: m.index, fin: re.lastIndex };
    } else {
      profondeur++;
    }
  }
  throw new Error(`balise <${nom}> non fermée (position ${debut})`);
}

function attribut(balise, nom) {
  const m = balise.match(new RegExp(`\\b${nom}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4]) : null;
}

const decoderEntites = (t) =>
  t
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const texteSeul = (html) => decoderEntites(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const EXTENSIONS = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/zip': 'zip',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'text/csv': 'csv'
};

// ---------------------------------------------------------------------------- source

/**
 * Trouve le fichier source : ATELIER_SOURCE, sinon le clone en cache (créé ou mis à jour au besoin).
 */
function trouverSource({ racine, source, maj, journal }) {
  const indique = source || process.env.ATELIER_SOURCE;
  if (indique) {
    const f = path.resolve(racine, indique);
    if (!existsSync(f)) throw new Error(`ATELIER_SOURCE introuvable : ${f}`);
    return f;
  }
  const cache = path.join(racine, '.cache', 'atelier-jansenosaure');
  if (!existsSync(path.join(cache, '.git'))) {
    journal.info(`atelier : clone de ${DEPOT_ATELIER} dans .cache/`);
    execFileSync('git', ['clone', '--quiet', '--depth', '1', '--branch', 'main', DEPOT_ATELIER, cache], { stdio: 'inherit' });
  } else if (maj) {
    journal.info('atelier : mise à jour du cache depuis GitHub');
    git(cache, 'fetch', '--quiet', '--depth', '1', 'origin', 'main');
    git(cache, 'reset', '--hard', '--quiet', 'FETCH_HEAD');
  }
  return path.join(cache, 'index.html');
}

/** Version de la source (commit du dépôt atelier), si le fichier est dans un clone Git. */
function versionSource(fichier) {
  const dir = path.dirname(fichier);
  try {
    const [sha, date, ...message] = git(dir, 'log', '-1', '--format=%H%n%cI%n%s').split('\n');
    return { sha, date, message: message.join('\n') };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------- import

/**
 * @param {{ racine: string, source?: string, maj?: boolean, force?: boolean,
 *           journal?: { info: (m: string) => void, warn: (m: string) => void } }} options
 */
export async function importerAtelier({ racine, source, maj = false, force = false, journal = console }) {
  const fichier = trouverSource({ racine, source, maj, journal });
  const html = await readFile(fichier, 'utf8');
  const genere = path.join(racine, 'src', 'atelier', 'genere');

  // Empreinte : la source, ce script et la version de three.js du site. Inchangée → rien à refaire.
  const versionThree = JSON.parse(readFileSync(path.join(racine, 'node_modules', 'three', 'package.json'), 'utf8')).version;
  const code = [
    readFileSync(fileURLToPath(import.meta.url), 'utf8'),
    readFileSync(path.join(ICI, 'css.mjs'), 'utf8')
  ].join('\n');
  const empreinte = sha256(sha256(html) + sha256(code) + versionThree).slice(0, 16);
  if (!force) {
    try {
      const ancien = JSON.parse(await readFile(path.join(genere, 'sommaire.json'), 'utf8'));
      if (ancien.empreinte === empreinte) {
        journal.info(`atelier : déjà importé (${ancien.source?.sha?.slice(0, 7) ?? 'source locale'})`);
        return ancien;
      }
    } catch {
      /* premier import */
    }
  }

  const avertissements = [];
  const avertir = (m) => {
    avertissements.push(m);
    journal.warn(`atelier : ${m}`);
  };

  // --- three.js : le site embarque une version précise, elle doit être celle que l'atelier attend
  const rThree = 'r' + versionThree.split('.')[1];
  const mThree = html.match(/three(?:\.js)?\/(r\d+)\//i) || html.match(/three@0\.(\d+)/i);
  if (!mThree) {
    throw new Error("l'atelier ne charge plus three.js comme prévu : adapter scripts/atelier/importer.mjs");
  }
  const rAttendu = mThree[1].startsWith('r') ? mThree[1] : 'r' + mThree[1];
  if (rAttendu !== rThree) {
    throw new Error(
      `l'atelier demande three.js ${rAttendu}, le site embarque ${rThree} : ` +
        `installer la même version (npm install --save-exact three@0.${rAttendu.slice(1)}.0) puis relancer`
    );
  }

  // --- titre et onglets
  const mTitre = html.match(/<header[^>]*class="entete"[^>]*>[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let titre = 'Atelier Jansenosaure';
  let surtitre = '';
  if (mTitre) {
    const mSmall = mTitre[1].match(/<small[^>]*>([\s\S]*?)<\/small>/i);
    surtitre = mSmall ? texteSeul(mSmall[1]) : '';
    titre = texteSeul(mTitre[1].replace(/<small[^>]*>[\s\S]*?<\/small>/i, '')) || titre;
  } else {
    avertir("en-tête de l'atelier introuvable : titre par défaut");
  }

  const mNav = html.match(/<nav[^>]*class="onglets"[^>]*>([\s\S]*?)<\/nav>/i);
  if (!mNav) throw new Error('barre des onglets (<nav class="onglets">) introuvable');
  const onglets = [];
  for (const m of mNav[1].matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const id = attribut(m[1], 'data-page');
    if (!id) continue;
    if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`identifiant d'onglet inattendu : ${id}`);
    onglets.push({ id, label: texteSeul(m[2]) });
  }
  if (!onglets.some((o) => o.id === 'voir')) throw new Error('onglet « voir » (la 3D) introuvable');

  // --- sections (une par onglet)
  const sections = new Map();
  const reSection = /<section\b[^>]*>/gi;
  let ms;
  const zonesSections = [];
  while ((ms = reSection.exec(html))) {
    const balise = ms[0];
    const id = attribut(balise, 'id');
    const classes = (attribut(balise, 'class') || '').split(/\s+/);
    const b = finDeBalise(html, ms.index, 'section');
    if (classes.includes('page') && id) {
      sections.set(id, html.slice(b.interieur, b.fermante));
      zonesSections.push([ms.index, b.fin]);
    }
    reSection.lastIndex = b.fin;
  }
  for (const o of onglets) if (!sections.has(o.id)) throw new Error(`section de l'onglet « ${o.id} » introuvable`);

  const horsSections = (pos) => !zonesSections.some(([a, b]) => pos >= a && pos < b);

  // --- feuilles de style hors sections (sauf l'aperçu sans JavaScript, en <noscript>)
  const zonesNoscript = [...html.matchAll(/<noscript\b[\s\S]*?<\/noscript>/gi)].map((m) => [m.index, m.index + m[0].length]);
  const dansNoscript = (pos) => zonesNoscript.some(([a, b]) => pos >= a && pos < b);
  let cssPrincipal = '';
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (horsSections(m.index) && !dansNoscript(m.index)) cssPrincipal += m[1] + '\n';
  }

  // --- jetons de couleur et de police de l'atelier : renommés en --at-* (le site a les siens)
  const jetons = jetonsRacine(cssPrincipal);
  if (!jetons.size) avertir('aucun jeton :root dans la feuille de style de l\'atelier');
  const noms = [...jetons.keys()].sort((a, b) => b.length - a.length);
  const reJetons = noms.length
    ? new RegExp(`--(${noms.map((n) => n.replace(/[-]/g, '\\-')).join('|')})(?![\\w-])`, 'g')
    : null;
  const renommer = (t) => (reJetons ? t.replace(reJetons, '--at-$1') : t);

  // --- scripts hors sections
  let visualiseur = null;
  let panne = null;
  let donnees = null;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!horsSections(m.index)) continue;
    const attrs = m[1];
    const corps = m[2];
    const type = (attribut(attrs, 'type') || '').toLowerCase();
    const id = attribut(attrs, 'id');
    if (attribut(attrs, 'src')) {
      if (!/three/i.test(attribut(attrs, 'src'))) avertir(`script externe ignoré : ${attribut(attrs, 'src')}`);
      continue;
    }
    if (type === 'application/json') {
      if (id === 'donnees') donnees = corps;
      else avertir(`données JSON hors onglet ignorées (#${id})`);
      continue;
    }
    if (/WebGLRenderer/.test(corps)) visualiseur = corps;
    else if (/window\.__panne\s*=/.test(corps)) panne = corps;
    else if (/pdf-ouvrir|xlsx-enregistrer|claude\.use\(\s*["']downloads/.test(corps)) continue; // remplacés par de vrais fichiers
    else avertir(`script inconnu ignoré : ${corps.trim().slice(0, 60).replace(/\s+/g, ' ')}…`);
  }
  if (!visualiseur) throw new Error('visualiseur 3D introuvable (script avec WebGLRenderer)');
  if (!donnees) throw new Error('données du modèle (<script id="donnees">) introuvables');

  // --- données du modèle : contrôle de forme
  let D;
  try {
    D = JSON.parse(donnees);
  } catch (e) {
    throw new Error(`données du modèle illisibles : ${e.message}`);
  }
  if (!Array.isArray(D.meshes) || !D.meshes.length) throw new Error('données du modèle sans pièces (meshes)');
  if (!Array.isArray(D.thetas) || typeof D.frames !== 'object') throw new Error('données du modèle sans poses (thetas, frames)');

  // --- visualiseur : quelques raccords, chacun contrôlé
  let vis = renommer(visualiseur);
  if (!/getElementById\(\s*["']donnees["']\s*\)/.test(vis)) {
    throw new Error('le visualiseur ne lit plus #donnees : adapter scripts/atelier/importer.mjs');
  }
  // 1. palette des matières : le site la règle avant la construction des pièces
  const mMat = vis.match(/const\s+MAT\s*=\s*\{/);
  if (mMat) {
    const debut = mMat.index + mMat[0].length - 1;
    let p = 0;
    let fin = -1;
    for (let k = debut; k < vis.length; k++) {
      if (vis[k] === '{') p++;
      else if (vis[k] === '}' && --p === 0) {
        fin = k + 1;
        break;
      }
    }
    const pv = vis.indexOf(';', fin);
    if (fin > 0 && pv >= 0 && /^\s*$/.test(vis.slice(fin, pv))) {
      vis =
        vis.slice(0, pv + 1) +
        '\nif (typeof window.__atelierMatieres === "function") window.__atelierMatieres(MAT);   // [site] palette du thème\n' +
        vis.slice(pv + 1);
    } else avertir('palette MAT non raccordée : la 3D garde les couleurs d\'origine');
  } else avertir('palette MAT introuvable : la 3D garde les couleurs d\'origine');
  // 2. couleur de surlignage des pièces
  const nSurligne = (vis.match(/0xD8601F/gi) || []).length;
  if (nSurligne) vis = vis.replace(/0xD8601F/gi, '(window.__atelierSurligne || 0xD8601F)');
  else avertir('couleur de surlignage introuvable : surlignage d\'origine');
  // 3. signal « modèle construit », pour l'habillage (arêtes, lumières, changement de thème)
  const iConstruire = vis.lastIndexOf('construire();');
  if (iConstruire >= 0 && !/function\s+$/.test(vis.slice(0, iConstruire))) {
    const apres = iConstruire + 'construire();'.length;
    vis =
      vis.slice(0, apres) +
      '\ntry {   // [site] le modèle est construit : l\'habillage du site s\'y branche\n' +
      '  const d = { THREE, scene, pieces, MAT, redessiner };\n' +
      '  try { d.orb = orb; d.poseCam = poseCam; } catch (e) { /* cadrage d\'origine */ }\n' +
      '  window.dispatchEvent(new CustomEvent("atelier:pret", { detail: d }));\n' +
      '} catch (e) { console.warn("atelier : habillage non raccordé", e); }\n' +
      vis.slice(apres);
  } else avertir('appel construire() introuvable : pas d\'habillage de la 3D');

  const entete = (quoi) =>
    `/* Généré par scripts/atelier/importer.mjs depuis ${PAGE_DEPOT} — ${quoi}. Ne pas modifier : refait à chaque build. */\n`;
  const visualiseurTs =
    '// @ts-nocheck\n' +
    entete('visualiseur 3D, enveloppé en module ; three.js est fourni par le site') +
    'export default function demarrer(THREE) {\n' +
    vis.trim() +
    '\n}\n';

  // --- onglets : styles internes, fichiers embarqués, renvois entre onglets
  const fichiers = new Map(); // nom sur disque -> { donnees, type, nom }
  const urlOnglet = (id) => BASE_ATELIER + (id === 'voir' ? '' : id + '/');
  const reLabels = onglets
    .map((o) => o.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');
  const espace = '(?:\\s|\\u00a0|\\u202f|&nbsp;|&#8239;)*';
  let cssOnglets = '';
  const fragments = new Map();

  for (const o of onglets) {
    let h = sections.get(o.id);

    h = h.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => {
      cssOnglets += `/* onglet ${o.id} */\n` + confiner(renommer(css), PORTEE, avertir) + '\n';
      return '';
    });

    // fichiers embarqués en data: → vrais fichiers, adresse posée par la page (@@FICHIER:nom@@)
    h = h.replace(/<a\b([^>]*?)\bhref="data:([^;,"]+)(;base64)?,([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi, (_tout, av, type, b64, contenu, ap, texte) => {
      const attrs = av + ap;
      const ext = EXTENSIONS[type.toLowerCase()] || 'bin';
      const nomDemande = attribut(attrs, 'download') || `fichier-${fichiers.size + 1}.${ext}`;
      const nom = nomDemande.replace(/[^\w.-]+/g, '_');
      const octets = b64 ? Buffer.from(contenu, 'base64') : Buffer.from(decodeURIComponent(contenu), 'utf8');
      const deja = fichiers.get(nom);
      if (deja && sha256(deja.donnees) !== sha256(octets)) throw new Error(`deux fichiers embarqués différents nommés ${nom}`);
      fichiers.set(nom, { donnees: octets, type: type.toLowerCase(), nom: nomDemande });
      const id = attribut(attrs, 'id') || '';
      const ouvrir = /-ouvrir$/.test(id) || /^\s*ouvrir\b/i.test(texteSeul(texte));
      let nouveaux = attrs;
      if (ouvrir) nouveaux = nouveaux.replace(/\s*\bdownload(\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/i, '') + ' target="_blank" rel="noopener"';
      return `<a${nouveaux} href="@@FICHIER:${nom}@@">${texte}</a>`;
    });
    // liens « Enregistrer » qui attendaient le script (href="#" download="nom" hidden)
    h = h.replace(/<a\b([^>]*)>/gi, (tout, attrs) => {
      const dl = attribut(attrs, 'download');
      if (!dl || attribut(attrs, 'href') !== '#') return tout;
      const nom = dl.replace(/[^\w.-]+/g, '_');
      if (!fichiers.has(nom)) return tout;
      const a = attrs.replace(/\bhref="#"/, `href="@@FICHIER:${nom}@@"`).replace(/\s+hidden(?=[\s>]|$)/i, '');
      return `<a${a}>`;
    });

    // « l'onglet « Acheter » » → lien vers la page de cet onglet
    if (reLabels) {
      const reRenvoi = new RegExp(`(onglets?${espace}(?:«|&laquo;)${espace})(${reLabels})(${espace}(?:»|&raquo;))`, 'g');
      h = h.replace(reRenvoi, (t, a, label, c) => {
        const cible = onglets.find((x) => x.label === label);
        return cible && cible.id !== o.id ? `${a}<a href="${urlOnglet(cible.id)}">${label}</a>${c}` : t;
      });
      const reRenvoiNu = new RegExp(`(onglet${espace})(${reLabels})(?=[\\s.,;:)])`, 'g');
      h = h.replace(reRenvoiNu, (t, a, label) => {
        const cible = onglets.find((x) => x.label === label);
        return cible && cible.id !== o.id ? `${a}<a href="${urlOnglet(cible.id)}">${label}</a>` : t;
      });
    }

    h = renommer(h);
    if (/\son\w+\s*=/.test(h.replace(/<script\b[\s\S]*?<\/script>/gi, ''))) avertir(`onglet ${o.id} : gestionnaire d'événement en attribut (on…=) conservé`);
    if (/https?:\/\/(fonts\.googleapis|cdnjs|unpkg|cdn\.jsdelivr)/.test(h)) avertir(`onglet ${o.id} : ressource externe chargée par le contenu`);
    fragments.set(o.id, h.trim());
    o.h1 = /<h1\b/i.test(h);
  }

  // --- feuille de style : valeurs d'origine des jetons (repli), puis styles confinés
  const repli = [...jetons].map(([n, v]) => `  --at-${n}: ${renommer(v)};`).join('\n');
  const css =
    entete('feuille de style, confinée sous .atelier') +
    `/* Valeurs d'origine des jetons : src/atelier/atelier.css les remplace par ceux du site */\n:root {\n${repli}\n}\n` +
    confiner(renommer(cssPrincipal), PORTEE, avertir) +
    '\n' +
    cssOnglets;

  // --- écriture : dossier temporaire, puis remplacement d'un coup
  const tmp = genere + '.tmp';
  await rm(tmp, { recursive: true, force: true });
  await mkdir(path.join(tmp, 'onglets'), { recursive: true });
  await mkdir(path.join(tmp, 'fichiers'), { recursive: true });
  for (const [id, h] of fragments) await writeFile(path.join(tmp, 'onglets', `${id}.html`), h + '\n');
  for (const [nom, f] of fichiers) await writeFile(path.join(tmp, 'fichiers', nom), f.donnees);
  await writeFile(path.join(tmp, 'donnees.json'), donnees.trim());
  await writeFile(path.join(tmp, 'visualiseur.ts'), visualiseurTs);
  await writeFile(path.join(tmp, 'panne.js'), panne ? panne.trim() + '\n' : '');
  await writeFile(path.join(tmp, 'atelier.css'), css);

  const version = versionSource(fichier);
  const sommaire = {
    empreinte,
    importeLe: new Date().toISOString(),
    source: {
      depot: PAGE_DEPOT,
      sha: version?.sha ?? null,
      date: version?.date ?? null,
      message: version?.message ?? null,
      taille: Buffer.byteLength(html)
    },
    titre,
    surtitre,
    three: rThree,
    base: BASE_ATELIER,
    onglets: onglets.map((o) => ({ id: o.id, label: o.label, h1: o.h1, url: urlOnglet(o.id) })),
    fichiers: [...fichiers].map(([fichier, f]) => ({ fichier, nom: f.nom, type: f.type, taille: f.donnees.length })),
    modele: { pieces: D.meshes.length, poses: D.thetas.length },
    avertissements
  };
  await writeFile(path.join(tmp, 'sommaire.json'), JSON.stringify(sommaire, null, 2) + '\n');

  await rm(genere, { recursive: true, force: true });
  await rename(tmp, genere);

  journal.info(
    `atelier : importé ${version?.sha?.slice(0, 7) ?? path.basename(fichier)} — ${onglets.length} onglets, ` +
      `${D.meshes.length} pièces, ${fichiers.size} fichier(s)` +
      (avertissements.length ? `, ${avertissements.length} avertissement(s)` : '')
  );
  return sommaire;
}

// ---------------------------------------------------------------------------- ligne de commande

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const iSource = args.indexOf('--source');
  importerAtelier({
    racine: path.resolve(ICI, '..', '..'),
    source: iSource >= 0 ? args[iSource + 1] : undefined,
    maj: args.includes('--maj'),
    force: args.includes('--force') || args.includes('--maj')
  }).catch((e) => {
    console.error(`atelier : ÉCHEC de l'import — ${e.message}`);
    process.exit(1);
  });
}
