// Petit processeur CSS, sans dépendance, pour les feuilles de style de l'atelier.
//
// Il ne fait que deux choses, sur du CSS écrit par le générateur de l'atelier (donc connu et sage) :
//  - préfixer chaque sélecteur par la portée (`.atelier`), pour que les styles de l'atelier
//    ne débordent pas sur le reste du site ;
//  - retirer les règles qui visent `:root`, `html` ou `body` : le site définit lui-même la page
//    et les jetons de couleur (src/atelier/atelier.css).
// Les @media et @supports sont parcourus ; @keyframes est gardé tel quel ; @font-face et
// @import sont retirés (les polices de l'atelier sont remplacées par celles du site).

/** Découpe un texte CSS en nœuds de premier niveau. */
function analyser(css) {
  const noeuds = [];
  let i = 0;
  const n = css.length;

  function sauterCommentaire() {
    if (css[i] === '/' && css[i + 1] === '*') {
      const fin = css.indexOf('*/', i + 2);
      i = fin < 0 ? n : fin + 2;
      return true;
    }
    return false;
  }

  // Lit jusqu'au « { » ou au « ; » de premier niveau ; renvoie [texte, caractère trouvé]
  function lireEnTete() {
    let debut = i;
    let texte = '';
    let profondeur = 0;
    while (i < n) {
      const c = css[i];
      if (c === '/' && css[i + 1] === '*') {
        texte += css.slice(debut, i);
        sauterCommentaire();
        debut = i;
        continue;
      }
      if (c === '"' || c === "'") {
        const fin = finDeChaine(css, i);
        i = fin;
        continue;
      }
      if (c === '(' || c === '[') profondeur++;
      else if (c === ')' || c === ']') profondeur--;
      else if (profondeur === 0 && (c === '{' || c === ';' || c === '}')) {
        texte += css.slice(debut, i);
        return [texte.trim(), c];
      }
      i++;
    }
    texte += css.slice(debut, i);
    return [texte.trim(), ''];
  }

  // Lit un bloc équilibré à partir d'un « { » ; renvoie son contenu (sans les accolades)
  function lireBloc() {
    const debut = i + 1;
    let profondeur = 0;
    while (i < n) {
      const c = css[i];
      if (c === '/' && css[i + 1] === '*') {
        sauterCommentaire();
        continue;
      }
      if (c === '"' || c === "'") {
        i = finDeChaine(css, i);
        continue;
      }
      if (c === '{') profondeur++;
      else if (c === '}') {
        profondeur--;
        if (profondeur === 0) {
          const contenu = css.slice(debut, i);
          i++;
          return contenu;
        }
      }
      i++;
    }
    throw new Error('CSS : accolade non fermée');
  }

  while (i < n) {
    if (/\s/.test(css[i])) {
      i++;
      continue;
    }
    if (sauterCommentaire()) continue;
    const [tete, arret] = lireEnTete();
    if (arret === ';') {
      i++;
      if (tete) noeuds.push({ type: 'instruction', texte: tete });
      continue;
    }
    if (arret === '}') {
      // accolade orpheline : on l'ignore
      i++;
      continue;
    }
    if (arret !== '{') break;
    const corps = lireBloc();
    if (tete.startsWith('@')) {
      const nom = tete.slice(1).split(/[\s(]/)[0].toLowerCase();
      noeuds.push({ type: 'arobase', nom, prelude: tete, corps });
    } else {
      noeuds.push({ type: 'regle', selecteur: tete, corps });
    }
  }
  return noeuds;
}

function finDeChaine(texte, i) {
  const q = texte[i];
  let j = i + 1;
  while (j < texte.length && texte[j] !== q) {
    if (texte[j] === '\\') j++;
    j++;
  }
  return j + 1;
}

/** Sépare une liste de sélecteurs sur les virgules de premier niveau. */
export function separerSelecteurs(liste) {
  const morceaux = [];
  let profondeur = 0;
  let debut = 0;
  for (let i = 0; i < liste.length; i++) {
    const c = liste[i];
    if (c === '"' || c === "'") {
      i = finDeChaine(liste, i) - 1;
      continue;
    }
    if (c === '(' || c === '[') profondeur++;
    else if (c === ')' || c === ']') profondeur--;
    else if (c === ',' && profondeur === 0) {
      morceaux.push(liste.slice(debut, i).trim());
      debut = i + 1;
    }
  }
  morceaux.push(liste.slice(debut).trim());
  return morceaux.filter(Boolean);
}

/** Vrai si le sélecteur vise la page elle-même (racine, html, body). */
function viseLaPage(sel) {
  return /:root\b/.test(sel) || /^(html|body)\b/i.test(sel) || /(^|[\s>+~,])(html|body)(?=$|[\s.:#[>+~])/i.test(sel);
}

/**
 * Préfixe et filtre une feuille de style.
 * @param {string} css
 * @param {string} portee sélecteur de portée, ex. « .atelier »
 * @param {(m: string) => void} [avertir]
 * @returns {string}
 */
export function confiner(css, portee, avertir = () => {}) {
  return serialiser(analyser(css), portee, avertir, 0);
}

function serialiser(noeuds, portee, avertir, niveau) {
  const ind = '  '.repeat(niveau);
  const sortie = [];
  for (const nd of noeuds) {
    if (nd.type === 'instruction') {
      if (/^@import\b/i.test(nd.texte)) avertir(`CSS : ${nd.texte.slice(0, 80)} retiré (pas de dépendance réseau)`);
      else if (/^@charset\b/i.test(nd.texte)) continue;
      else avertir(`CSS : instruction inconnue retirée : ${nd.texte.slice(0, 80)}`);
      continue;
    }
    if (nd.type === 'arobase') {
      if (nd.nom === 'media' || nd.nom === 'supports' || nd.nom === 'container' || nd.nom === 'layer') {
        const dedans = serialiser(analyser(nd.corps), portee, avertir, niveau + 1);
        if (dedans.trim()) sortie.push(`${ind}${nd.prelude} {\n${dedans}\n${ind}}`);
      } else if (nd.nom === 'keyframes' || nd.nom === '-webkit-keyframes') {
        sortie.push(`${ind}${nd.prelude} {${nd.corps}}`);
      } else if (nd.nom === 'font-face') {
        avertir('CSS : @font-face retiré (les polices du site remplacent celles de l\'atelier)');
      } else {
        avertir(`CSS : @${nd.nom} retiré`);
      }
      continue;
    }
    const gardes = separerSelecteurs(nd.selecteur)
      .filter((s) => !viseLaPage(s))
      .map((s) => `${portee} ${s}`);
    if (!gardes.length) continue;
    sortie.push(`${ind}${gardes.join(',\n' + ind)} {${nd.corps.trim() ? ' ' + nd.corps.trim().replace(/\s*\n\s*/g, ' ') + ' ' : ''}}`);
  }
  return sortie.join('\n');
}

/**
 * Noms des propriétés personnalisées définies sur `:root` (hors @media), avec leur valeur.
 * @param {string} css
 * @returns {Map<string, string>}
 */
export function jetonsRacine(css) {
  const jetons = new Map();
  for (const nd of analyser(css)) {
    if (nd.type !== 'regle') continue;
    if (!separerSelecteurs(nd.selecteur).some((s) => s === ':root')) continue;
    for (const decl of nd.corps.split(';')) {
      const m = decl.match(/^\s*--([\w-]+)\s*:\s*([\s\S]+?)\s*$/);
      if (m && !jetons.has(m[1])) jetons.set(m[1], m[2]);
    }
  }
  return jetons;
}
