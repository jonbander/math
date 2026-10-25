/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export type SpeechStatus = 'idle' | 'speaking' | 'needs-arabic-voice' | 'error';
type SpeechStatusListener = (status: SpeechStatus) => void;

const NUMBER_WORDS: Record<number, string> = {
  0: 'صِفْر', 1: 'واحِد', 2: 'اِثْنان', 3: 'ثَلاثَة', 4: 'أَرْبَعَة', 5: 'خَمْسَة',
  6: 'سِتَّة', 7: 'سَبْعَة', 8: 'ثَمانِيَة', 9: 'تِسْعَة', 10: 'عَشَرَة',
};

class ArabicSpeechService {
  private voice: SpeechSynthesisVoice | null = null;
  private muted = false;
  private status: SpeechStatus = 'idle';
  private listeners = new Set<SpeechStatusListener>();
  private voiceWait: Promise<SpeechSynthesisVoice[]> | null = null;
  private speechRequestId = 0;

  constructor() {
    try {
      this.muted = localStorage.getItem('arabic_math_sound_muted') === 'true';
    } catch {
      this.muted = false;
    }
  }

  public subscribe(listener: SpeechStatusListener) {
    this.listeners.add(listener);
    listener(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(status: SpeechStatus) {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) void this.stop();
  }

  public async stop() {
    this.speechRequestId++;
    try {
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.stop();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.warn('[ArabicSpeech] stop failed', error);
    } finally {
      this.setStatus('idle');
    }
  }

  private async speakNative(text: string, rate: number, requestId: number) {
    // Pick an installed Arabic locale rather than assuming the device has ar-SA data.
    const candidates = ['ar-SA', 'ar', 'ar-EG', 'ar-AE', 'ar-MA'];
    let selectedLanguage: string | null = null;
    let languageCheckWorked = false;
    for (let attempt = 0; attempt < 3 && !selectedLanguage; attempt++) {
      for (const lang of candidates) {
        try {
          const { supported } = await TextToSpeech.isLanguageSupported({ lang });
          languageCheckWorked = true;
          if (supported) {
            selectedLanguage = lang;
            break;
          }
        } catch {
          // The native TTS engine can still be initializing on a cold app launch.
        }
      }
      if (!selectedLanguage && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250));
    }

    if (!selectedLanguage) {
      if (requestId === this.speechRequestId) {
        this.setStatus(languageCheckWorked ? 'needs-arabic-voice' : 'error');
      }
      return;
    }
    if (requestId !== this.speechRequestId) return;

    await TextToSpeech.speak({
      text,
      lang: selectedLanguage,
      rate,
      pitch: 1.05,
      volume: 1,
      queueStrategy: 0,
    });
  }

  private async getWebVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!('speechSynthesis' in window)) return [];
    const synthesis = window.speechSynthesis;
    const current = synthesis.getVoices();
    if (current.length) return current;
    if (!this.voiceWait) {
      this.voiceWait = new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const timer = window.setTimeout(() => {
          synthesis.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(synthesis.getVoices());
        }, 2500);
        const onVoicesChanged = () => {
          const voices = synthesis.getVoices();
          if (voices.length) {
            window.clearTimeout(timer);
            synthesis.removeEventListener('voiceschanged', onVoicesChanged);
            resolve(voices);
          }
        };
        synthesis.addEventListener('voiceschanged', onVoicesChanged);
      }).finally(() => {
        this.voiceWait = null;
      });
    }
    return this.voiceWait ?? [];
  }

  private async speakWeb(text: string, rate: number, requestId: number) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      throw new Error('Speech synthesis is unavailable in this browser.');
    }

    const voices = await this.getWebVoices();
    if (requestId !== this.speechRequestId) return;
    this.voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith('ar')) ?? null;
    if (!this.voice) {
      if (requestId === this.speechRequestId) this.setStatus('needs-arabic-voice');
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      utterance.lang = this.voice?.lang ?? 'ar-SA';
      utterance.rate = rate;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  public async speak(text: string, rate = 0.8) {
    if (this.muted || !text.trim()) return;
    const requestId = ++this.speechRequestId;
    this.setStatus('speaking');
    try {
      if (Capacitor.isNativePlatform()) {
        await this.speakNative(text, rate, requestId);
      } else {
        await this.speakWeb(text, rate, requestId);
      }
      if (requestId === this.speechRequestId && this.status === 'speaking') this.setStatus('idle');
    } catch (error) {
      console.error('[ArabicSpeech] speak failed', error);
      if (requestId === this.speechRequestId) this.setStatus('error');
    }
  }

  public async openArabicVoiceInstaller() {
    if (!Capacitor.isNativePlatform()) {
      this.setStatus('needs-arabic-voice');
      return;
    }
    try {
      await TextToSpeech.openInstall();
    } catch (error) {
      console.error('[ArabicSpeech] open voice installer failed', error);
      this.setStatus('error');
    }
  }

  public speakNumber(num: number) {
    void this.speak(NUMBER_WORDS[num] ?? String(num), 0.75);
  }

  public speakEquation(a: number, op: '+' | '-' | '>' | '<' | '=', b: number, res?: number) {
    const aWord = NUMBER_WORDS[a] ?? String(a);
    const bWord = NUMBER_WORDS[b] ?? String(b);
    if (op === '+') {
      void this.speak(`${aWord} زائد ${bWord} يساوي ${res === undefined ? '' : NUMBER_WORDS[res] ?? res}`, 0.8);
    } else if (op === '-') {
      void this.speak(`${aWord} ناقص ${bWord} يساوي ${res === undefined ? '' : NUMBER_WORDS[res] ?? res}`, 0.8);
    } else if (op === '>') {
      void this.speak(`${aWord} أكبر من ${bWord}`, 0.8);
    } else if (op === '<') {
      void this.speak(`${aWord} أصغر من ${bWord}`, 0.8);
    } else {
      void this.speak(`${aWord} يساوي ${bWord}`, 0.8);
    }
  }
}

export const arabicSpeech = new ArabicSpeechService();
