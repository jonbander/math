/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveAppMode, NumeralSystem } from '../types/math';
import { soundManager } from '../utils/soundEffects';

interface HeaderProps {
  currentMode: ActiveAppMode;
  onSelectMode: (mode: ActiveAppMode) => void;
  numeralSystem: NumeralSystem;
  onToggleNumeralSystem: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onOpenBadges: () => void;
  unlockedBadgesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  numeralSystem,
  onToggleNumeralSystem,
  isSoundMuted,
  onToggleSound,
  onOpenBadges,
  unlockedBadgesCount,
}) => {
  return (
    <header className="border-b border-amber-200/80 bg-white/95 backdrop-blur-xs sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark (Goes to Home) */}
        <div
          onClick={() => {
            soundManager.playClick();
            onSelectMode('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white text-xl font-black shadow-xs">
            ١٢٣
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 whitespace-nowrap">
            أبطال الرياضيات (عمر ٦ سنوات)
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('home');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'home'
                ? 'bg-amber-100 text-amber-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🏠 الرئيسية
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('tracing');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'tracing'
                ? 'bg-amber-100 text-amber-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ✏️ كتابة الأعداد
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('addition');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'addition'
                ? 'bg-blue-100 text-blue-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ➕ الجمع
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('subtraction');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'subtraction'
                ? 'bg-rose-100 text-rose-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ➖ الطرح
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('scale');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'scale'
                ? 'bg-purple-100 text-purple-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ⚖️ الميزان
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onSelectMode('explore');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'explore' || currentMode === 'adventure' || currentMode === 'speedQuiz'
                ? 'bg-amber-100 text-amber-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🔬 الألعاب
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Numeral Toggle + Badges + Sound) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Numeral System Toggle */}
          <button
            onClick={onToggleNumeralSystem}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            title="تبديل رسم الأرقام"
          >
            <span>الأرقام:</span>
            <span className="font-extrabold text-amber-700">
              {numeralSystem === 'eastern' ? '١ ٢ ٣' : numeralSystem === 'both' ? '١ (1)' : '1 2 3'}
            </span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-sm"
            title={isSoundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {isSoundMuted ? '🔇' : '🔊'}
          </button>

          {/* Badges Trophy Action */}
          <button
            onClick={onOpenBadges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>🏅 الأوسمة</span>
            {unlockedBadgesCount > 0 && (
              <span className="bg-amber-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {unlockedBadgesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex lg:hidden items-center justify-around border-t border-slate-100 py-2 px-1 bg-slate-50/90 text-[11px] font-bold">
        <button
          onClick={() => onSelectMode('home')}
          className={`px-2 py-1 rounded-lg ${
            currentMode === 'home' ? 'bg-amber-500 text-white' : 'text-slate-600'
          }`}
        >
          الرئيسية 🏠
        </button>
        <button
          onClick={() => onSelectMode('tracing')}
          className={`px-2 py-1 rounded-lg ${
            currentMode === 'tracing' ? 'bg-amber-500 text-white' : 'text-slate-600'
          }`}
        >
          الكتابة ✏️
        </button>
        <button
          onClick={() => onSelectMode('addition')}
          className={`px-2 py-1 rounded-lg ${
            currentMode === 'addition' ? 'bg-blue-500 text-white' : 'text-slate-600'
          }`}
        >
          الجمع ➕
        </button>
        <button
          onClick={() => onSelectMode('subtraction')}
          className={`px-2 py-1 rounded-lg ${
            currentMode === 'subtraction' ? 'bg-rose-500 text-white' : 'text-slate-600'
          }`}
        >
          الطرح ➖
        </button>
        <button
          onClick={() => onSelectMode('scale')}
          className={`px-2 py-1 rounded-lg ${
            currentMode === 'scale' ? 'bg-purple-500 text-white' : 'text-slate-600'
          }`}
        >
          الميزان ⚖️
        </button>
      </div>
    </header>
  );
};
