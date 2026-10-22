/**
 * Synthesised sound effects — no audio assets required.
 *
 * Everything is generated with the Web Audio API, so the game ships with a
 * handful of kilobytes instead of a folder of wav files.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  private ensure(): boolean {
    if (!this.enabled) return false;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return false;
      try {
        this.ctx = new Ctor();
      } catch {
        this.enabled = false;
        return false;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return true;
  }

  /** Browsers require a user gesture before audio starts. */
  unlock(): void {
    this.ensure();
  }

  private tone(
    freq: number,
    duration: number,
    opts: {
      type?: OscillatorType;
      gain?: number;
      delay?: number;
      slideTo?: number;
      attack?: number;
    } = {},
  ): void {
    if (!this.ensure() || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (opts.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slideTo), start + duration);
    }

    const peak = opts.gain ?? 0.2;
    const attack = opts.attack ?? 0.01;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private noise(duration: number, opts: { gain?: number; delay?: number; filter?: number } = {}): void {
    if (!this.ensure() || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + (opts.delay ?? 0);
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = opts.filter ?? 900;
    const gain = ctx.createGain();
    gain.gain.value = opts.gain ?? 0.2;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(start);
  }

  /** Soft bubble for the UI. */
  click(): void {
    this.tone(520, 0.08, { type: 'sine', gain: 0.12, slideTo: 780 });
  }

  /** A low thud as the prompt appears. */
  dive(): void {
    this.tone(180, 0.5, { type: 'sine', gain: 0.18, slideTo: 90 });
    this.noise(0.4, { gain: 0.08, filter: 500 });
  }

  /** Answer accepted — a short ascending blip. */
  accept(): void {
    this.tone(440, 0.12, { type: 'triangle', gain: 0.16 });
    this.tone(660, 0.16, { type: 'triangle', gain: 0.14, delay: 0.08 });
  }

  /** Answer refused — a muted descending blip. */
  refuse(): void {
    this.tone(300, 0.18, { type: 'sawtooth', gain: 0.1, slideTo: 160 });
  }

  /** Tick as the clock runs down. */
  tick(high: boolean): void {
    this.tone(high ? 1200 : 900, 0.04, { type: 'square', gain: 0.05 });
  }

  /** A Fin-tastic answer — a shimmering chord. */
  fintastic(): void {
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      this.tone(freq, 1.4, { type: 'sine', gain: 0.14, delay: i * 0.09 });
    });
    this.noise(1.1, { gain: 0.07, filter: 2400, delay: 0.05 });
  }

  /** A deep cut — a heavy sonar hit. */
  deep(): void {
    this.tone(120, 0.9, { type: 'sine', gain: 0.22, slideTo: 60 });
    this.tone(240, 0.7, { type: 'triangle', gain: 0.1, delay: 0.05 });
  }

  /** Run over. */
  surface(): void {
    this.tone(330, 0.7, { type: 'sine', gain: 0.16, slideTo: 660 });
  }

  /** Air tank lost. */
  airOut(): void {
    this.noise(0.7, { gain: 0.22, filter: 1600 });
    this.tone(200, 0.6, { type: 'sine', gain: 0.14, slideTo: 70 });
  }
}

export const sfx = new Sfx();
