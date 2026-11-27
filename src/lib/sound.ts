import { SoundEvent } from "@/types/game";

/**
 * Zero-dependency Web Audio API procedural sound synthesizer and ambient
 * arcade synthwave music engine.
 */
class ArcadeAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private soundEnabled = true;
  private musicEnabled = true;
  private volume = 0.7;

  private musicTimer: number | null = null;
  private musicStep = 0;
  private isPlayingMusic = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.syncGains();
    }

    if (this.ctx.state === "suspended") {
      void this.ctx
        .resume()
        .then(() => {
          this.syncGains();
          if (this.soundEnabled && this.musicEnabled && !this.isPlayingMusic) {
            this.startMusic();
          }
        })
        .catch(() => {});
    }

    return this.ctx;
  }

  public unlock(): void {
    const ctx = this.ensureContext();
    if (
      ctx &&
      ctx.state === "running" &&
      this.soundEnabled &&
      this.musicEnabled &&
      !this.isPlayingMusic
    ) {
      this.startMusic();
    }
  }

  public updateSettings(opts: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    soundVolume: number;
  }): void {
    this.soundEnabled = opts.soundEnabled;
    this.musicEnabled = opts.musicEnabled;
    this.volume = Math.max(0, Math.min(1, opts.soundVolume));
    this.syncGains();

    if (!this.soundEnabled || !this.musicEnabled) {
      this.stopMusic();
    } else if (this.ctx && this.ctx.state === "running" && !this.isPlayingMusic) {
      this.startMusic();
    }
  }

  private syncGains(): void {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain) {
      return;
    }
    const now = this.ctx.currentTime;
    const master = this.soundEnabled ? this.volume : 0;
    this.masterGain.gain.setTargetAtTime(master, now, 0.02);
    this.sfxGain.gain.setTargetAtTime(0.9, now, 0.02);
    this.musicGain.gain.setTargetAtTime(
      this.soundEnabled && this.musicEnabled ? 0.38 : 0,
      now,
      0.05
    );
  }

  public handleSoundEvent(event: SoundEvent): void {
    switch (event.type) {
      case "paddleHit":
        this.playPaddleHit(event.speedRatio, event.isPlayer1);
        break;
      case "wallHit":
        this.playWallHit();
        break;
      case "score":
        this.playScore(event.scorer);
        break;
      case "countdown":
        this.playCountdown(event.value);
        break;
      case "gameStart":
        this.playGameStart();
        break;
      case "win":
        this.playWin();
        break;
      case "lose":
        this.playLose();
        break;
    }
  }

  public playUiClick(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.05);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playPaddleHit(speedRatio: number, isPlayer1: boolean): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const baseFreq = isPlayer1 ? 420 : 350;
    const freq = baseFreq + Math.min(1.2, speedRatio) * 180;

    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + 0.045);

    sub.type = "sine";
    sub.frequency.setValueAtTime(freq * 0.5, now);
    sub.frequency.exponentialRampToValueAtTime(110, now + 0.07);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    sub.start(now);
    osc.stop(now + 0.095);
    sub.stop(now + 0.095);
  }

  public playWallHit(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(270, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.055);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playScore(scorer: 1 | 2): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const notes = scorer === 1 ? [523.25, 659.25, 783.99] : [392.0, 493.88, 587.33];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.19);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  public playCountdown(value: number): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const freq = value === 0 ? 880 : 440;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (value === 0 ? 0.18 : 0.11));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + (value === 0 ? 0.19 : 0.12));
  }

  public playGameStart(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const freqs = [330, 440, 660, 880];
    freqs.forEach((f, idx) => {
      const t = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  public playWin(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((f, idx) => {
      const t = now + idx * 0.095;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.45 : 0.22));
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.48);
    });
  }

  public playLose(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const melody = [440, 392, 329.63, 246.94];
    melody.forEach((f, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.42 : 0.22));
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public startMusic(): void {
    if (typeof window === "undefined") return;
    if (!this.soundEnabled || !this.musicEnabled) return;
    if (this.isPlayingMusic) return;

    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;

    this.isPlayingMusic = true;
    this.syncGains();

    // Subtle 115 BPM cyberpunk bassline + arp pattern (16th-note pulse every ~130ms)
    const bassPattern = [
      65.41, 65.41, 0, 65.41,
      77.78, 77.78, 0, 77.78,
      58.27, 58.27, 0, 58.27,
      73.42, 73.42, 87.31, 73.42,
    ];
    const arpPattern = [
      261.63, 311.13, 392.0, 523.25,
      311.13, 392.0, 466.16, 622.25,
      233.08, 293.66, 349.23, 466.16,
      293.66, 349.23, 440.0, 587.33,
    ];

    const stepMs = 155;
    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.soundEnabled || !this.musicEnabled) {
        return;
      }
      if (this.ctx.state !== "running") return;

      const idx = this.musicStep % bassPattern.length;
      const now = this.ctx.currentTime;

      const bassFreq = bassPattern[idx];
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(bassFreq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(340, now);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.14);
      }

      if (this.musicStep % 2 === 0) {
        const arpFreq = arpPattern[idx];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(arpFreq, now);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.23);
      }

      this.musicStep = (this.musicStep + 1) % 64;
    }, stepMs);
  }

  public stopMusic(): void {
    if (this.musicTimer !== null && typeof window !== "undefined") {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.isPlayingMusic = false;
  }
}

export const arcadeAudio = new ArcadeAudioEngine();
