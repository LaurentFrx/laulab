/**
 * Sons de la scène, synthétisés à la volée (aucun fichier audio).
 * Un pas = un court bruit filtré et un petit « toc » grave. Rien ne joue sans action de l'utilisateur.
 */
let ctx: AudioContext | null = null;
let maitre: GainNode | null = null;

export function sonPret(): boolean {
  return ctx !== null && ctx.state === 'running';
}

/** À appeler depuis un clic : crée (ou réveille) le contexte audio. */
export async function activerSon(): Promise<boolean> {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      maitre = ctx.createGain();
      maitre.gain.value = 0.35;
      maitre.connect(ctx.destination);
    }
    if (ctx.state !== 'running') await ctx.resume();
    return ctx.state === 'running';
  } catch {
    return false;
  }
}

export async function couperSon(): Promise<void> {
  try {
    if (ctx && ctx.state === 'running') await ctx.suspend();
  } catch {
    /* rien à faire */
  }
}

/** Un pas : variante légère selon la patte (0–3) pour ne pas être monotone. */
export function pas(patte = 0, force = 1): void {
  if (!ctx || !maitre || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  // Bruit bref, filtré en bande
  const n = ctx.sampleRate * 0.06;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filtre = ctx.createBiquadFilter();
  filtre.type = 'bandpass';
  filtre.frequency.value = 1400 + patte * 180;
  filtre.Q.value = 1.2;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0.5 * force, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  src.connect(filtre).connect(g1).connect(maitre);
  src.start(t);
  src.stop(t + 0.08);
  // Petit toc grave
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150 + patte * 12, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.35 * force, t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(g2).connect(maitre);
  osc.start(t);
  osc.stop(t + 0.11);
}
