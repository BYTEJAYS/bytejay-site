/**
 * WALL·E voice box: synthesized chirps and a tread-motor hum via the
 * Web Audio API. No audio files; everything is generated on the fly.
 */

let ctx: AudioContext | null = null;
let motorOsc: OscillatorNode | null = null;
let motorGain: GainNode | null = null;
let motorFilter: BiquadFilterNode | null = null;

const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

/** Call from a user gesture (keydown/pointer) to unlock audio. */
export const unlockAudio = () => {
  void getCtx();
};

type ChirpOpts = {
  from: number;
  to: number;
  dur: number;
  delay?: number;
  vol?: number;
  type?: OscillatorType;
};

/** One robot syllable: a pitch-sliding tone with vibrato and a soft envelope. */
const chirp = ({ from, to, dur, delay = 0, vol = 0.06, type = "triangle" }: ChirpOpts) => {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;

  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);

  // vibrato gives it the warbly "voice" quality
  const vib = ac.createOscillator();
  vib.frequency.value = 22;
  const vibGain = ac.createGain();
  vibGain.gain.value = from * 0.045;
  vib.connect(vibGain).connect(osc.frequency);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.setValueAtTime(vol, t0 + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  vib.start(t0);
  osc.stop(t0 + dur + 0.02);
  vib.stop(t0 + dur + 0.02);
};

/** "waaa-leee": his two-syllable rising hello. */
export const sfxGreet = () => {
  chirp({ from: 340, to: 620, dur: 0.32, vol: 0.07 });
  chirp({ from: 500, to: 940, dur: 0.42, delay: 0.4, vol: 0.07 });
  chirp({ from: 940, to: 1150, dur: 0.16, delay: 0.86, vol: 0.05, type: "sine" });
};

/** Curious little beep-boop when he discovers a painting. */
export const sfxReact = () => {
  const up = Math.random() > 0.4;
  const base = 420 + Math.random() * 260;
  chirp({ from: base, to: up ? base * 1.7 : base * 0.65, dur: 0.16, vol: 0.055 });
  chirp({
    from: up ? base * 1.5 : base * 0.8,
    to: up ? base * 2.1 : base * 0.55,
    dur: 0.2,
    delay: 0.2,
    vol: 0.05,
  });
};

/** Soft descending farewell at the exit. */
export const sfxFarewell = () => {
  chirp({ from: 880, to: 560, dur: 0.3, vol: 0.06 });
  chirp({ from: 620, to: 300, dur: 0.5, delay: 0.36, vol: 0.055 });
};

/** Low filtered tread-motor hum; runs while he drives. */
export const startMotor = () => {
  const ac = getCtx();
  if (!ac || motorOsc) return;

  motorOsc = ac.createOscillator();
  motorOsc.type = "sawtooth";
  motorOsc.frequency.value = 55;

  // slight speed wobble so it sounds mechanical, not synthetic
  const wobble = ac.createOscillator();
  wobble.frequency.value = 7;
  const wobbleGain = ac.createGain();
  wobbleGain.gain.value = 4;
  wobble.connect(wobbleGain).connect(motorOsc.frequency);
  wobble.start();

  motorFilter = ac.createBiquadFilter();
  motorFilter.type = "lowpass";
  motorFilter.frequency.value = 190;

  motorGain = ac.createGain();
  motorGain.gain.setValueAtTime(0, ac.currentTime);
  motorGain.gain.linearRampToValueAtTime(0.035, ac.currentTime + 0.12);

  motorOsc.connect(motorFilter).connect(motorGain).connect(ac.destination);
  motorOsc.start();
  motorOsc.onended = () => wobble.stop();
};

export const stopMotor = () => {
  if (!ctx || !motorOsc || !motorGain) return;
  const osc = motorOsc;
  const gain = motorGain;
  motorOsc = null;
  motorGain = null;
  motorFilter = null;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  osc.stop(ctx.currentTime + 0.18);
};
