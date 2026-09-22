// Original, synthesized click sounds -- built with the Web Audio API's
// oscillator, not sampled or ripped from any existing game (Pac-Man,
// Crash Bandicoot, etc. audio is copyrighted; this recreates the general
// "retro blip" vibe from scratch instead). Lazily creates one AudioContext
// on first use, since browsers block audio contexts created before any
// user gesture.

export type SoundPack = "arcade" | "chime" | "8bit";

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Each pack is a short (<120ms) blip defined as one or two quick tone
// segments -- frequency glide + fast decay is what gives it that
// 8-bit/arcade character, entirely synthesized.
function playTone(freqStart: number, freqEnd: number, durationMs: number, type: OscillatorType, gainPeak: number) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  const now = audioCtx.currentTime;
  const dur = durationMs / 1000;
  osc.frequency.setValueAtTime(freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + dur);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function playClickSound(pack: SoundPack) {
  switch (pack) {
    case "arcade":
      playTone(220, 440, 70, "square", 0.05);
      break;
    case "chime":
      playTone(880, 1320, 90, "sine", 0.04);
      break;
    case "8bit":
      playTone(160, 100, 60, "square", 0.06);
      break;
  }
}

export const SOUND_PACKS: { id: SoundPack; label: string }[] = [
  { id: "arcade", label: "Arcade Blip" },
  { id: "chime", label: "Chime Pop" },
  { id: "8bit", label: "8-Bit Thud" },
];
