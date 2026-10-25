/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type Tone = {
  frequency: number;
  offset: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  endFrequency?: number;
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  constructor() {
    try {
      this.isMuted = localStorage.getItem('arabic_math_sound_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private async getReadyContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state !== 'running') {
      try {
        await this.ctx.resume();
      } catch {
        return null;
      }
    }
    return this.ctx.state === 'running' ? this.ctx : null;
  }

  private playTones(tones: Tone[]) {
    if (this.isMuted) return;

    // Await resume before scheduling; on Android WebView a suspended context's
    // currentTime may not advance, which used to silence short interaction sounds.
    void this.getReadyContext().then((ctx) => {
      if (!ctx || this.isMuted) return;
      const now = ctx.currentTime;

      tones.forEach(({ frequency, offset, duration, volume, type = 'sine', endFrequency }) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + offset;
        const end = start + duration;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        if (endFrequency !== undefined) {
          oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
        }

        gain.gain.setValueAtTime(Math.max(volume, 0.0001), start);
        gain.gain.exponentialRampToValueAtTime(0.001, end);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(end + 0.01);
      });
    }).catch(() => {
      // Audio is optional; keep the learning activity working if unavailable.
    });
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('arabic_math_sound_muted', String(this.isMuted));
    } catch {
      // Storage may be disabled in a private browsing context.
    }
    if (!this.isMuted) void this.getReadyContext();
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playPop() {
    this.playTones([{ frequency: 450, endFrequency: 800, offset: 0, duration: 0.1, volume: 0.15 }]);
  }

  public playCorrect() {
    this.playTones([523.25, 659.25, 783.99, 1046.5].map((frequency, index) => ({
      frequency, offset: index * 0.08, duration: 0.25, volume: 0.2, type: 'triangle',
    })));
  }

  public playCheer() {
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    this.playTones(notes.map((frequency, index) => ({
      frequency, offset: index * 0.07, duration: index === notes.length - 1 ? 0.6 : 0.2, volume: 0.22,
    })));
  }

  public playWrong() {
    this.playTones([311.13, 293.66].map((frequency, index) => ({
      frequency, offset: index * 0.12, duration: 0.2, volume: 0.12,
    })));
  }

  public playClick() {
    this.playTones([{ frequency: 600, offset: 0, duration: 0.04, volume: 0.08 }]);
  }

  public playTilt() {
    this.playTones([{ frequency: 320, endFrequency: 260, offset: 0, duration: 0.15, volume: 0.1, type: 'triangle' }]);
  }
}

export const soundManager = new SoundManager();
