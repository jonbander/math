/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ComparisonSymbol, ItemTheme, NumeralSystem, OperationKind } from '../types/math';
import { formatNum, getItemTheme } from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';

interface SpeedQuizModeProps {
  numeralSystem: NumeralSystem;
  onTaskCompleted?: (id: string, title: string) => void;
}

interface QuickQuestion {
  text: string;
  correct: number | ComparisonSymbol;
  options: (number | ComparisonSymbol)[];
  emoji: string;
}

export const SpeedQuizMode: React.FC<SpeedQuizModeProps> = ({ numeralSystem, onTaskCompleted }) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [currentQ, setCurrentQ] = useState<QuickQuestion | null>(null);

  const generateQuickQuestion = (): QuickQuestion => {
    const ops: OperationKind[] = ['addition', 'subtraction', 'multiplication', 'comparison'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const emojis = ['⭐', '✏️', '⚽', '🍎', '🍊', '🍬'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    if (op === 'addition') {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      const ans = a + b;
      const options = [ans, ans + 1, Math.max(1, ans - 1), ans + 2].sort(() => Math.random() - 0.5);
      return {
        text: `${formatNum(a, numeralSystem)} + ${formatNum(b, numeralSystem)} = ؟`,
        correct: ans,
        options,
        emoji,
      };
    } else if (op === 'subtraction') {
      const a = Math.floor(Math.random() * 6) + 4;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      const ans = a - b;
      const options = [ans, ans + 1, Math.max(0, ans - 1), ans + 2].sort(() => Math.random() - 0.5);
      return {
        text: `${formatNum(a, numeralSystem)} - ${formatNum(b, numeralSystem)} = ؟`,
        correct: ans,
        options,
        emoji,
      };
    } else if (op === 'multiplication') {
      const a = Math.floor(Math.random() * 3) + 2;
      const b = Math.floor(Math.random() * 3) + 2;
      const ans = a * b;
      const options = [ans, ans + 2, Math.max(2, ans - 2), ans + 3].sort(() => Math.random() - 0.5);
      return {
        text: `${formatNum(a, numeralSystem)} × ${formatNum(b, numeralSystem)} = ؟`,
        correct: ans,
        options,
        emoji,
      };
    } else {
      // Comparison
      const a = Math.floor(Math.random() * 8) + 1;
      const diff = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const b = Math.max(1, a + diff);
      const ans: ComparisonSymbol = a > b ? '>' : a < b ? '<' : '=';
      return {
        text: `${formatNum(a, numeralSystem)} [ ؟ ] ${formatNum(b, numeralSystem)}`,
        correct: ans,
        options: ['>', '=', '<'],
        emoji: '⚖️',
      };
    }
  };

  const handleStart = () => {
    soundManager.playClick();
    setTimeLeft(60);
    setScore(0);
    setQuestionCount(0);
    setIsFinished(false);
    setIsActive(true);
    setCurrentQ(generateQuickQuestion());
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      onTaskCompleted?.('speed-quiz:one-minute', 'إنهاء تحدي الدقيقة');
      soundManager.playCheer();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleSelectAnswer = (option: number | ComparisonSymbol) => {
    if (!currentQ || !isActive) return;

    if (option === currentQ.correct) {
      soundManager.playCorrect();
      setScore((s) => s + 10);
    } else {
      soundManager.playWrong();
    }
    setQuestionCount((c) => c + 1);
    setCurrentQ(generateQuickQuestion());
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-slate-800">تحدي الدقيقة الرياضي السريع ⚡</h2>
        <p className="text-xs text-slate-500">
          أجب عن أكبر قدر ممكن من المسائل الحسابية خلال ٦٠ ثانية!
        </p>
      </div>

      {!isActive && !isFinished && (
        <div className="text-center py-8 space-y-4">
          <div className="text-6xl animate-pulse">⏱️</div>
          <p className="text-sm text-slate-600 font-medium">
            هل أنت مستعد لاختبار سرعتك وذكائك في الجمع والطرح والضرب والمقارنة؟
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-md transition-all cursor-pointer"
          >
            ابدأ التحدي الآن! 🚀
          </button>
        </div>
      )}

      {isActive && currentQ && (
        <div className="space-y-6">
          {/* Header timer and points */}
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-1.5 text-rose-600 font-black text-base">
              <span>⏰ الوقت:</span>
              <span>{formatNum(timeLeft, numeralSystem)} ثانية</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-900 font-black text-base">
              <span>⭐ النقاط:</span>
              <span>{formatNum(score, numeralSystem)}</span>
            </div>
          </div>

          {/* Time progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-6 text-center space-y-3">
            <span className="text-3xl">{currentQ.emoji}</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wider">
              {currentQ.text}
            </div>
          </div>

          {/* Options */}
          <div
            className={`grid gap-3 ${
              currentQ.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {currentQ.options.map((opt, i) => (
              <button
                key={`speed-opt-${i}`}
                onClick={() => handleSelectAnswer(opt)}
                className="h-16 rounded-2xl bg-white hover:bg-amber-50 border-2 border-slate-200 active:scale-95 text-2xl font-black text-slate-900 shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                {typeof opt === 'number' ? formatNum(opt, numeralSystem) : opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {isFinished && (
        <div className="text-center py-6 space-y-5 animate-pop">
          <div className="text-5xl">🎉</div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">انتهى الوقت يا بطل!</h3>
            <p className="text-sm text-slate-500 mt-1">نتيجة مذهلة ورائعة!</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-200 max-w-sm mx-auto">
            <div>
              <div className="text-xs text-slate-500 font-bold">النقاط المحققة</div>
              <div className="text-2xl font-black text-amber-700">{formatNum(score, numeralSystem)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold">المسائل المحلولة</div>
              <div className="text-2xl font-black text-emerald-600">{formatNum(questionCount, numeralSystem)}</div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md transition-all cursor-pointer"
          >
            إعادة التحدي مرة أخرى 🔄
          </button>
        </div>
      )}
    </div>
  );
};
