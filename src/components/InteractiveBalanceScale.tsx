/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ComparisonSymbol, ItemTheme, NumeralSystem } from '../types/math';
import { formatNum, getItemTheme } from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';
import { ManipulativeIcon } from './ManipulativeIcon';

interface InteractiveBalanceScaleProps {
  numeralSystem: NumeralSystem;
  defaultTheme?: ItemTheme;
  onGoHome?: () => void;
  onTaskCompleted?: (id: string, title: string) => void;
}

export const InteractiveBalanceScale: React.FC<InteractiveBalanceScaleProps> = ({
  numeralSystem,
  defaultTheme = 'apples',
  onGoHome,
  onTaskCompleted,
}) => {
  const [theme, setTheme] = useState<ItemTheme>(defaultTheme);
  const [leftCount, setLeftCount] = useState<number>(3);
  const [rightCount, setRightCount] = useState<number>(5);
  const [selectedGuess, setSelectedGuess] = useState<ComparisonSymbol | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const themeMeta = getItemTheme(theme);

  // Compute tilt angle (in degrees): clamp between -15 and +15
  // If left is heavier, left pan goes DOWN, so beam tilts counterclockwise (- angle or + angle depending on coordinate system)
  const diff = leftCount - rightCount;
  const tiltAngle = Math.max(-14, Math.min(14, diff * 3));

  const correctSymbol: ComparisonSymbol = leftCount > rightCount ? '>' : leftCount < rightCount ? '<' : '=';

  useEffect(() => {
    soundManager.playTilt();
    setSelectedGuess(null);
    setFeedback(null);
  }, [leftCount, rightCount]);

  const handleGuess = (symbol: ComparisonSymbol) => {
    soundManager.playClick();
    setSelectedGuess(symbol);

    if (symbol === correctSymbol) {
      soundManager.playCorrect();
      setFeedback({
        isCorrect: true,
        message: 'أحسنت يا بطل! إجابة صحيحة ورائعة!',
      });
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
      onTaskCompleted?.(
        `scale:${leftCount}:${rightCount}`,
        `مقارنة ${formatNum(leftCount, numeralSystem)} و${formatNum(rightCount, numeralSystem)}`,
      );
    } else {
      soundManager.playWrong();
      setFeedback({
        isCorrect: false,
        message: 'حاول مرة أخرى! انظر إلى كفتي الميزان وأيهما تحتوي على عناصر أكثر.',
      });
    }
  };

  const handleRandomize = () => {
    soundManager.playClick();
    const l = Math.floor(Math.random() * 8) + 1;
    const r = Math.floor(Math.random() * 8) + 1;
    setLeftCount(l);
    setRightCount(r);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6">
      {/* Header controls: Item picker & quick random challenge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {onGoHome && (
            <button
              onClick={() => {
                soundManager.playClick();
                onGoHome();
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🏠</span>
              <span>الرئيسية</span>
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-800">ميزان المقارنة التفاعلي (أكبر / أصغر / يساوي)</h2>
            <p className="text-xs text-slate-500">
              ضع العناصر في كفتي الميزان وشاهد كيف تتأرجح الكفة الأثقل!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['apples', 'stars', 'balls', 'pencils', 'candies'] as ItemTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  soundManager.playClick();
                  setTheme(t);
                }}
                className={`px-2.5 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  theme === t ? 'bg-white shadow-xs font-bold scale-105' : 'hover:bg-slate-200/60'
                }`}
                title={getItemTheme(t).pluralName}
              >
                {getItemTheme(t).emoji}
              </button>
            ))}
          </div>

          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            تحدّي جديد 🎲
          </button>
        </div>
      </div>

      {/* SVG Balance Scale Visualizer */}
      <div className="relative w-full max-w-xl mx-auto py-6 flex flex-col items-center">
        {/* SVG Structure */}
        <div className="w-full h-56 relative flex items-center justify-center">
          <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
            {/* Base and Central Pillar */}
            <path d="M 230 230 L 270 230 L 255 120 L 245 120 Z" fill="#94A3B8" />
            <rect x="210" y="225" width="80" height="12" rx="4" fill="#64748B" />
            {/* Fulcrum hinge point */}
            <circle cx="250" cy="115" r="12" fill="#475569" stroke="#334155" strokeWidth="2" />
            <circle cx="250" cy="115" r="5" fill="#E2E8F0" />

            {/* Tilting Beam Group */}
            <g
              transform={`rotate(${tiltAngle}, 250, 115)`}
              className="transition-transform duration-500 ease-out"
            >
              {/* Beam */}
              <rect x="50" y="110" width="400" height="10" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
              {/* Pointer indicator */}
              <polygon points="250,110 246,80 254,80" fill="#EF4444" />

              {/* Left Pan Strings & Plate */}
              <g transform="translate(90, 115)">
                <line x1="0" y1="0" x2="-35" y2="60" stroke="#94A3B8" strokeWidth="2" />
                <line x1="0" y1="0" x2="35" y2="60" stroke="#94A3B8" strokeWidth="2" />
                <path d="M -45 60 Q 0 80 45 60 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
              </g>

              {/* Right Pan Strings & Plate */}
              <g transform="translate(410, 115)">
                <line x1="0" y1="0" x2="-35" y2="60" stroke="#94A3B8" strokeWidth="2" />
                <line x1="0" y1="0" x2="35" y2="60" stroke="#94A3B8" strokeWidth="2" />
                <path d="M -45 60 Q 0 80 45 60 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
              </g>
            </g>
          </svg>

          {/* Left Pan HTML Overlay (Items) */}
          <div
            className="absolute left-6 sm:left-14 top-16 w-28 sm:w-36 flex flex-col items-center pointer-events-auto transition-transform duration-500"
            style={{
              transform: `translateY(${tiltAngle * 3}px)`,
            }}
          >
            <div className="bg-white/95 border-2 border-amber-300 rounded-xl p-2 shadow-sm min-h-[64px] flex flex-wrap gap-1 items-center justify-center w-full">
              {Array.from({ length: leftCount }, (_, i) => (
                <ManipulativeIcon
                  key={`scale-l-${i}`}
                  theme={theme}
                  size="sm"
                  index={i + 1}
                  numeralSystem={numeralSystem}
                />
              ))}
              {leftCount === 0 && <span className="text-xs text-slate-400">فارغة (٠)</span>}
            </div>
            <span className="mt-1 text-xs font-bold text-slate-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
              الكفة اليمنى: {formatNum(leftCount, numeralSystem)}
            </span>
          </div>

          {/* Right Pan HTML Overlay (Items) */}
          <div
            className="absolute right-6 sm:right-14 top-16 w-28 sm:w-36 flex flex-col items-center pointer-events-auto transition-transform duration-500"
            style={{
              transform: `translateY(${-tiltAngle * 3}px)`,
            }}
          >
            <div className="bg-white/95 border-2 border-indigo-300 rounded-xl p-2 shadow-sm min-h-[64px] flex flex-wrap gap-1 items-center justify-center w-full">
              {Array.from({ length: rightCount }, (_, i) => (
                <ManipulativeIcon
                  key={`scale-r-${i}`}
                  theme={theme}
                  size="sm"
                  index={i + 1}
                  numeralSystem={numeralSystem}
                />
              ))}
              {rightCount === 0 && <span className="text-xs text-slate-400">فارغة (٠)</span>}
            </div>
            <span className="mt-1 text-xs font-bold text-slate-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-300">
              الكفة اليسرى: {formatNum(rightCount, numeralSystem)}
            </span>
          </div>
        </div>

        {/* Counter Adjusters */}
        <div className="w-full flex items-center justify-between px-4 sm:px-12 mt-4">
          {/* Left Adjusters */}
          <div className="flex items-center gap-1.5 bg-amber-50 p-2 rounded-xl border border-amber-200">
            <button
              onClick={() => {
                soundManager.playClick();
                setLeftCount(Math.max(0, leftCount - 1));
              }}
              disabled={leftCount <= 0}
              className="w-8 h-8 rounded-lg bg-white border border-amber-300 font-extrabold text-amber-800 disabled:opacity-40 hover:bg-amber-100 cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center font-black text-amber-900 text-lg">
              {formatNum(leftCount, numeralSystem)}
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                setLeftCount(Math.min(9, leftCount + 1));
              }}
              disabled={leftCount >= 9}
              className="w-8 h-8 rounded-lg bg-amber-500 text-white font-extrabold disabled:opacity-40 hover:bg-amber-600 cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <span
              className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${
                leftCount === rightCount
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {leftCount === rightCount ? 'متساويان في الوزن! (=)' : leftCount > rightCount ? 'الطرف الأيمن أثقل (أكثر)' : 'الطرف الأيسر أثقل (أكثر)'}
            </span>
          </div>

          {/* Right Adjusters */}
          <div className="flex items-center gap-1.5 bg-indigo-50 p-2 rounded-xl border border-indigo-200">
            <button
              onClick={() => {
                soundManager.playClick();
                setRightCount(Math.max(0, rightCount - 1));
              }}
              disabled={rightCount <= 0}
              className="w-8 h-8 rounded-lg bg-white border border-indigo-300 font-extrabold text-indigo-800 disabled:opacity-40 hover:bg-indigo-100 cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center font-black text-indigo-900 text-lg">
              {formatNum(rightCount, numeralSystem)}
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                setRightCount(Math.min(9, rightCount + 1));
              }}
              disabled={rightCount >= 9}
              className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold disabled:opacity-40 hover:bg-indigo-700 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Sign Question: What sign goes in between? */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-center space-y-3">
        <div className="text-sm font-bold text-slate-800">
          ما هي الإشارة الصحيحة التي نضعها في المربع بين العددين؟
        </div>

        <div className="flex items-center justify-center gap-4 text-xl sm:text-2xl font-black text-slate-900">
          <span className="bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-xs">
            {formatNum(leftCount, numeralSystem)}
          </span>

          <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-200/80 border-2 border-dashed border-amber-400 text-2xl font-black">
            {selectedGuess || '؟'}
          </span>

          <span className="bg-white px-4 py-2 rounded-xl border border-indigo-300 shadow-xs">
            {formatNum(rightCount, numeralSystem)}
          </span>
        </div>

        {/* Choice buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleGuess('>')}
            className={`px-5 py-2.5 rounded-xl text-lg font-black transition-all cursor-pointer ${
              selectedGuess === '>'
                ? selectedGuess === correctSymbol
                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                  : 'bg-rose-500 text-white'
                : 'bg-white hover:bg-slate-50 border-2 border-purple-300 text-purple-800 shadow-xs'
            }`}
          >
            &gt; (أكبر من)
          </button>

          <button
            onClick={() => handleGuess('=')}
            className={`px-5 py-2.5 rounded-xl text-lg font-black transition-all cursor-pointer ${
              selectedGuess === '='
                ? selectedGuess === correctSymbol
                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                  : 'bg-rose-500 text-white'
                : 'bg-white hover:bg-slate-50 border-2 border-emerald-300 text-emerald-800 shadow-xs'
            }`}
          >
            = (يُساوي)
          </button>

          <button
            onClick={() => handleGuess('<')}
            className={`px-5 py-2.5 rounded-xl text-lg font-black transition-all cursor-pointer ${
              selectedGuess === '<'
                ? selectedGuess === correctSymbol
                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                  : 'bg-rose-500 text-white'
                : 'bg-white hover:bg-slate-50 border-2 border-blue-300 text-blue-800 shadow-xs'
            }`}
          >
            &lt; (أصغر من)
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl font-bold text-sm animate-pop ${
              feedback.isCorrect
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};
