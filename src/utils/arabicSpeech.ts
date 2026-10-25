/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class ArabicSpeechService {
  private isSupported: boolean = false;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      this.loadVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoice();
      };
    }
  }

  private loadVoice() {
    if (!this.isSupported) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for Arabic voice
    const arVoice = voices.find((v) => v.lang.startsWith('ar') || v.lang.includes('AR'));
    if (arVoice) {
      this.voice = arVoice;
    }
  }

  public speak(text: string, rate: number = 0.8) {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.lang = 'ar-SA';
      utterance.rate = rate; // slightly slower, clear for 6-year-olds
      utterance.pitch = 1.1; // friendly slightly higher pitch for children
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech may not be permitted without user gesture
    }
  }

  public speakNumber(num: number) {
    const names: Record<number, string> = {
      0: 'صِفْر',
      1: 'واحِد',
      2: 'اِثْنان',
      3: 'ثَلاثَة',
      4: 'أَرْبَعَة',
      5: 'خَمْسَة',
      6: 'سِتَّة',
      7: 'سَبْعَة',
      8: 'ثَمانِيَة',
      9: 'تِسْعَة',
      10: 'عَشَرَة',
    };
    const word = names[num] || String(num);
    this.speak(word, 0.75);
  }

  public speakEquation(a: number, op: '+' | '-' | '>' | '<' | '=', b: number, res?: number) {
    const names: Record<number, string> = {
      0: 'صِفْر',
      1: 'واحد',
      2: 'اثنان',
      3: 'ثلاثة',
      4: 'أربعة',
      5: 'خمسة',
      6: 'ستة',
      7: 'سبعة',
      8: 'ثمانية',
      9: 'تسعة',
      10: 'عشرة',
    };
    const aWord = names[a] || String(a);
    const bWord = names[b] || String(b);

    if (op === '+') {
      const rWord = res !== undefined ? names[res] || String(res) : '';
      this.speak(`${aWord} زائد ${bWord} يُساوي ${rWord}`);
    } else if (op === '-') {
      const rWord = res !== undefined ? names[res] || String(res) : '';
      this.speak(`${aWord} نَاقِص ${bWord} يُساوي ${rWord}`);
    } else if (op === '>') {
      this.speak(`${aWord} أَكْبَرُ مِنْ ${bWord}`);
    } else if (op === '<') {
      this.speak(`${aWord} أَصْغَرُ مِنْ ${bWord}`);
    } else if (op === '=') {
      this.speak(`${aWord} يُسَاوِي ${bWord}`);
    }
  }
}

export const arabicSpeech = new ArabicSpeechService();
