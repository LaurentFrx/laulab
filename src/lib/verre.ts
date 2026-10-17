/**
 * Logo LF en verre sur fond transparent.
 *
 * Les vidéos du logo ont un fond blanc pur. Safari n'applique pas mix-blend-mode
 * aux vidéos : au lieu de fondre la vidéo dans la page, on la recopie image par
 * image dans un canvas en calculant la transparence de chaque pixel.
 *
 * - Cyanotype : négatif éclairci (les filtres CSS invert, hue-rotate(180deg),
 *   brightness, saturate), dont la luminance devient l'opacité — l'équivalent
 *   d'un fondu « screen » sur le bleu de Prusse.
 * - Calque : le blanc devient transparent (équivalent d'un fondu « multiply »),
 *   avec une correction gamma facultative qui fonce le verre.
 */

export interface Reglage {
  /** Cyanotype : gain du négatif (brightness) */
  gain: number;
  /** Cyanotype : saturation du négatif */
  saturation: number;
  /** Calque : exposants gamma R, G, B (1 = inchangé) */
  gamma: [number, number, number];
}

const borne = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// Matrice CSS hue-rotate(180deg) (spécification Filter Effects)
const H = [-0.574, 1.43, 0.144, 0.426, 0.43, 0.144, 0.426, 1.43, -0.856];

function matriceSaturation(s: number) {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s
  ];
}

/** Tables par composante : contraste 1,06 (ramène au blanc pur le bruit de compression du fond), puis négatif ou gamma. */
function tables(r: Reglage) {
  const negatif = new Float32Array(256);
  const calque = [new Float32Array(256), new Float32Array(256), new Float32Array(256)];
  for (let v = 0; v < 256; v++) {
    const c = borne((v / 255 - 0.5) * 1.06 + 0.5);
    negatif[v] = 1 - c;
    for (let k = 0; k < 3; k++) calque[k][v] = Math.pow(c, r.gamma[k]);
  }
  return { negatif, calque };
}

/**
 * Relie une vidéo (cachée) à un canvas de même taille. Le canvas montre l'affiche
 * tant que la vidéo n'a pas d'image, puis chaque image de la vidéo ; il se redessine
 * quand le thème change. La lecture (play / pause) reste à la charge de l'appelant.
 */
export function detourer(video: HTMLVideoElement, canvas: HTMLCanvasElement, affiche: string, reglage: Reglage) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const { negatif, calque } = tables(reglage);
  const S = matriceSaturation(reglage.saturation);
  const gain = reglage.gain;
  const image = new Image();
  image.src = affiche;

  function dessiner() {
    if (!ctx) return;
    let source: CanvasImageSource;
    if (video.readyState >= 2) source = video;
    else if (image.complete && image.naturalWidth) source = image;
    else return;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const cyano = document.documentElement.dataset.theme !== 'calque';
    for (let i = 0; i < d.length; i += 4) {
      let r: number, g: number, b: number, a: number;
      if (cyano) {
        const nr = negatif[d[i]], ng = negatif[d[i + 1]], nb = negatif[d[i + 2]];
        // hue-rotate(180deg), puis brightness, puis saturate — bornés à chaque étape comme les filtres CSS
        const hr = borne(H[0] * nr + H[1] * ng + H[2] * nb) * gain;
        const hg = borne(H[3] * nr + H[4] * ng + H[5] * nb) * gain;
        const hb = borne(H[6] * nr + H[7] * ng + H[8] * nb) * gain;
        const br = hr > 1 ? 1 : hr, bg = hg > 1 ? 1 : hg, bb = hb > 1 ? 1 : hb;
        r = borne(S[0] * br + S[1] * bg + S[2] * bb);
        g = borne(S[3] * br + S[4] * bg + S[5] * bb);
        b = borne(S[6] * br + S[7] * bg + S[8] * bb);
        a = Math.max(r, g, b);
        if (a > 0) {
          r /= a;
          g /= a;
          b /= a;
        }
      } else {
        // Ce qui manque au blanc devient de l'encre : opacité = écart maximal au blanc
        const er = 1 - calque[0][d[i]], eg = 1 - calque[1][d[i + 1]], eb = 1 - calque[2][d[i + 2]];
        a = Math.max(er, eg, eb);
        if (a > 0) {
          r = 1 - er / a;
          g = 1 - eg / a;
          b = 1 - eb / a;
        } else {
          r = g = b = 1;
        }
      }
      d[i] = r * 255;
      d[i + 1] = g * 255;
      d[i + 2] = b * 255;
      d[i + 3] = a * 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  // Une image dessinée par image décodée ; repli sur requestAnimationFrame
  const rvfc = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
  let enCours = false;
  function suivre() {
    if (video.paused || !canvas.isConnected) {
      enCours = false;
      return;
    }
    dessiner();
    if (rvfc) video.requestVideoFrameCallback(suivre);
    else requestAnimationFrame(suivre);
  }
  video.addEventListener('play', () => {
    if (enCours) return;
    enCours = true;
    if (rvfc) video.requestVideoFrameCallback(suivre);
    else requestAnimationFrame(suivre);
  });
  video.addEventListener('loadeddata', dessiner);
  video.addEventListener('seeked', dessiner);
  image.addEventListener('load', dessiner);
  dessiner();

  const theme = new MutationObserver(() => {
    if (!canvas.isConnected) theme.disconnect();
    else dessiner();
  });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
