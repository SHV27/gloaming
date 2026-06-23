// GLOAMING sound — fully procedural Web Audio. No asset files, no network, no
// autoplay violation (context resumes on first user gesture). Every call is
// wrapped so audio can NEVER break the game or the build.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = readMuted();
let started = false;

// ambient
let drone: { stop: () => void } | null = null;
let heartTimer: number | null = null;
let heartRate = 1.5; // seconds between beats (lower = faster)

function readMuted(): boolean {
  try {
    return localStorage.getItem("gloaming-muted") === "1";
  } catch {
    return false;
  }
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function now(): number {
  return ctx ? ctx.currentTime : 0;
}

// a single shaped tone
function tone(opts: { freq: number; dur: number; type?: OscillatorType; gain?: number; attack?: number; slideTo?: number; delay?: number }) {
  const c = ensure();
  if (!c || !master || muted) return;
  try {
    const t = now() + (opts.delay ?? 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type ?? "sine";
    o.frequency.setValueAtTime(opts.freq, t);
    if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slideTo), t + opts.dur);
    const peak = opts.gain ?? 0.25;
    const atk = opts.attack ?? 0.008;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + opts.dur + 0.05);
  } catch {
    /* never throw */
  }
}

function noise(dur: number, gain = 0.2, hp = 800) {
  const c = ensure();
  if (!c || !master || muted) return;
  try {
    const t = now();
    const frames = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = hp;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur + 0.02);
  } catch {
    /* noop */
  }
}

// ---- public SFX ----
export const sfx = {
  hover: () => tone({ freq: 520, dur: 0.05, type: "triangle", gain: 0.04 }),
  click: () => tone({ freq: 320, dur: 0.09, type: "triangle", gain: 0.12, slideTo: 220 }),
  move: () => tone({ freq: 240, dur: 0.16, type: "sine", gain: 0.1, slideTo: 300 }),
  light: () => {
    tone({ freq: 660, dur: 0.18, type: "sine", gain: 0.18 });
    tone({ freq: 990, dur: 0.22, type: "sine", gain: 0.12, delay: 0.04 });
  },
  omen: () => {
    tone({ freq: 150, dur: 0.4, type: "sawtooth", gain: 0.16, slideTo: 90 });
    noise(0.3, 0.08, 300);
  },
  relic: () => {
    tone({ freq: 520, dur: 0.3, type: "triangle", gain: 0.14 });
    tone({ freq: 780, dur: 0.36, type: "sine", gain: 0.1, delay: 0.06 });
    tone({ freq: 1040, dur: 0.4, type: "sine", gain: 0.08, delay: 0.12 });
  },
  ward: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, dur: 0.5, type: "sine", gain: 0.16, delay: i * 0.07 }));
  },
  burn: () => noise(0.5, 0.18, 500),
  collapse: () => {
    tone({ freq: 120, dur: 0.6, type: "sawtooth", gain: 0.22, slideTo: 40 });
    noise(0.5, 0.22, 200);
  },
  hollow: (proximity = 0.5) => {
    // approach stinger — higher & louder as it nears
    tone({ freq: 70 + proximity * 90, dur: 0.5, type: "sawtooth", gain: 0.08 + proximity * 0.14, slideTo: 50 });
  },
  claim: () => {
    tone({ freq: 90, dur: 1.4, type: "sine", gain: 0.3, slideTo: 38 });
    tone({ freq: 60, dur: 1.6, type: "sine", gain: 0.2, slideTo: 30 });
  },
  haunt: () => {
    tone({ freq: 200, dur: 1.8, type: "sawtooth", gain: 0.26, slideTo: 55 });
    tone({ freq: 80, dur: 2.0, type: "sine", gain: 0.22 });
    noise(1.2, 0.16, 400);
  },
  ritual: () => {
    [392, 523, 659].forEach((f, i) => tone({ freq: f, dur: 0.7, type: "sine", gain: 0.16, delay: i * 0.1 }));
  },
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone({ freq: f, dur: 0.8, type: "sine", gain: 0.18, delay: i * 0.12 })),
  lose: () => {
    tone({ freq: 110, dur: 2.4, type: "sawtooth", gain: 0.3, slideTo: 35 });
    noise(1.6, 0.18, 200);
  },
};

function thump() {
  if (muted) return;
  tone({ freq: 58, dur: 0.16, type: "sine", gain: 0.34, slideTo: 40 });
  tone({ freq: 52, dur: 0.2, type: "sine", gain: 0.22, slideTo: 36, delay: 0.16 });
}

function scheduleHeart() {
  if (heartTimer) window.clearTimeout(heartTimer);
  heartTimer = window.setTimeout(() => {
    if (started) thump();
    scheduleHeart();
  }, heartRate * 1000);
}

export function setDread(dread: number) {
  // 0 → ~1.5s between beats; 100 → ~0.45s (pounding)
  heartRate = Math.max(0.45, 1.5 - (dread / 100) * 1.05);
}

function startDrone() {
  const c = ensure();
  if (!c || !master) return;
  try {
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.value = 55;
    o2.frequency.value = 55.5; // beating
    g.gain.value = 0.06;
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    lfo.frequency.value = 0.08;
    lfoG.gain.value = 0.03;
    lfo.connect(lfoG).connect(g.gain);
    o1.connect(g);
    o2.connect(g);
    g.connect(master);
    o1.start();
    o2.start();
    lfo.start();
    drone = {
      stop: () => {
        try { o1.stop(); o2.stop(); lfo.stop(); } catch { /* noop */ }
      },
    };
  } catch {
    /* noop */
  }
}

// call on first user gesture and when entering a game
export function startAudio() {
  if (started) return;
  if (!ensure()) return;
  started = true;
  startDrone();
  scheduleHeart();
}

export function stopAmbient() {
  started = false;
  if (drone) { drone.stop(); drone = null; }
  if (heartTimer) { window.clearTimeout(heartTimer); heartTimer = null; }
}

export function toggleMute(): boolean {
  muted = !muted;
  try { localStorage.setItem("gloaming-muted", muted ? "1" : "0"); } catch { /* noop */ }
  if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.05);
  return muted;
}

export function isMuted(): boolean {
  return muted;
}
