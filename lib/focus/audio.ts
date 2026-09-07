export type FocusCue = "warning" | "tick" | "breakStart" | "workStart";

// A single AudioContext is reused for the entire Focus session. No downloaded
// sound assets, microphone permission or external audio service is required.
export class FocusAudioEngine {
  private context: AudioContext | null = null;
  private active = new Set<OscillatorNode>();

  get ready() {
    return this.context?.state === "running";
  }

  async unlock() {
    if (typeof window === "undefined") return false;
    try {
      const AudioContextClass = window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return false;
      if (!this.context || this.context.state === "closed") this.context = new AudioContextClass();
      if (this.context.state !== "running") await this.context.resume();
      return this.ready;
    } catch {
      return false;
    }
  }

  stop() {
    for (const oscillator of this.active) {
      try { oscillator.stop(); } catch { /* Already stopped. */ }
    }
    this.active.clear();
  }

  play(cue: FocusCue, volume: number) {
    const context = this.context;
    if (!context || context.state !== "running" || volume <= 0) return false;
    try {
      const now = context.currentTime;
      const loudness = Math.max(0, Math.min(1, volume / 100));
      const notes: Array<[number, number, number, number]> =
        cue === "warning" ? [[660, 0, 0.11, 0.45], [880, 0.17, 0.14, 0.45]] :
        cue === "tick" ? [[880, 0, 0.055, 0.18]] :
        cue === "breakStart" ? [[660, 0, 0.3, 0.65], [523.25, 0.23, 0.55, 0.75]] :
        [[523.25, 0, 0.25, 0.65], [659.25, 0.2, 0.28, 0.7], [783.99, 0.43, 0.45, 0.7]];

      for (const [frequency, offset, duration, strength] of notes) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = now + offset;
        const end = start + duration;
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.18 * strength * loudness), start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => {
          this.active.delete(oscillator);
          oscillator.disconnect();
          gain.disconnect();
        };
        this.active.add(oscillator);
        oscillator.start(start);
        oscillator.stop(end + 0.025);
      }
      return true;
    } catch {
      return false;
    }
  }

  async close() {
    this.stop();
    const context = this.context;
    this.context = null;
    try { if (context && context.state !== "closed") await context.close(); } catch { /* Ignore device shutdown. */ }
  }
}
