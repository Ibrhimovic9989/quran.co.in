// Mic pitch capture (Web Audio + autocorrelation) and shape-scoring helpers for
// the "Your turn" maqām practice. We compare the SHAPE of the learner's melody
// to the reference — normalized and correlation-scored — so absolute pitch and
// octave (male reciter vs any user) don't matter.

/** Map a pitch in Hz to a 0..1 ribbon height over a plausible vocal range. */
export function pitchToLevel(hz: number): number {
  const lo = Math.log2(90); // ~F#2
  const hi = Math.log2(520); // ~C5
  const v = (Math.log2(hz) - lo) / (hi - lo);
  return Math.max(0, Math.min(1, v));
}

/** Start mic capture; calls [onPitch] ~20×/s with a detected Hz (or null when
 *  unvoiced). Returns a stop() that releases the mic. Throws if permission is
 *  denied / no mic. */
export async function startPitchCapture(onPitch: (hz: number | null) => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  src.connect(analyser);
  const buf = new Float32Array(analyser.fftSize);
  let raf = 0;
  let last = 0;
  const tick = (t: number) => {
    if (t - last >= 50) { // ~20 Hz
      last = t;
      analyser.getFloatTimeDomainData(buf);
      onPitch(autoCorrelate(buf, ctx.sampleRate));
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    src.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    ctx.close();
  };
}

/** Autocorrelation pitch detector (after cwilso/PitchDetect). Returns Hz or
 *  null when the frame is too quiet / unvoiced. */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number | null {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // too quiet

  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  const b = buf.slice(r1, r2);
  const n = b.length;

  const c = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) c[i] += b[j] * b[j + i];

  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < n; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  let T0 = maxpos;
  if (T0 <= 0) return null;

  // Parabolic interpolation for a finer estimate.
  const x1 = c[T0 - 1] ?? 0, x2 = c[T0], x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const bb = (x3 - x1) / 2;
  if (a) T0 = T0 - bb / (2 * a);

  const hz = sampleRate / T0;
  if (hz < 70 || hz > 700) return null; // outside a plausible voice range
  return hz;
}

/** Resample an array to [n] points by linear interpolation. */
function resample(src: number[], n: number): number[] {
  if (src.length === 0) return new Array(n).fill(0);
  if (src.length === 1) return new Array(n).fill(src[0]);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (src.length - 1);
    const lo = Math.floor(t), hi = Math.min(src.length - 1, lo + 1);
    out.push(src[lo] + (src[hi] - src[lo]) * (t - lo));
  }
  return out;
}

function minMaxNorm(a: number[]): number[] {
  const lo = Math.min(...a), hi = Math.max(...a);
  if (hi - lo < 1e-6) return a.map(() => 0.5);
  return a.map((v) => (v - lo) / (hi - lo));
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  if (da < 1e-9 || db < 1e-9) return 0;
  return num / Math.sqrt(da * db);
}

/**
 * Score how closely the learner's melodic SHAPE followed the reference.
 * Both are normalized (min-max) and progress-aligned (resampled), then
 * correlated — so octave / absolute pitch don't matter, only the up-and-down
 * journey. Returns 0..100.
 */
export function shapeMatch(userPitchesHz: number[], referenceLevels: number[]): number {
  if (userPitchesHz.length < 6) return 0;
  const N = 64;
  const user = minMaxNorm(resample(userPitchesHz.map((h) => Math.log2(h)), N));
  const ref = resample(referenceLevels, N); // already 0..1
  const r = pearson(user, ref);
  return Math.round(Math.max(0, r) * 100);
}
