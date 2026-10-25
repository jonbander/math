/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ComparisonSymbol, ItemTheme, MathProblem, NumeralSystem, OperationKind } from '../types/math';
import {
  formatNum,
  getItemTheme,
  MANIPULATIVE_ITEMS,
  OPERATIONS_META,
  toArabicWords,
} from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';
import { VisualMathDisplay } from './VisualMathDisplay';

interface AdventureGameModeProps {
  numeralSystem: NumeralSystem;
  onBadgeUnlock?: (badgeId: string) => void;
  onTaskCompleted?: (id: string, title: string) => void;
}

export const AdventureGameMode: React.FC<AdventureGameModeProps> = ({
  numeralSystem,
  onBadgeUnlock,
  onTaskCompleted,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OperationKind | 'mixed'>('addition');
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | ComparisonSymbol | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showVisualAid, setShowVisualAid] = useState<boolean>(true);
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);

  // Helper to generate an array of questions
  const generateProblems = (category: OperationKind | 'mixed'): MathProblem[] => {
    const list: MathProblem[] = [];
    const themes: ItemTheme[] = ['stars', 'pencils', 'balls', 'apples', 'oranges', 'candies'];
    const opTypes: OperationKind[] =
      category === 'mixed'
        ? ['addition', 'subtraction', 'multiplication', 'division', 'comparison']
        : [category];

    for (let i = 0; i < 8; i++) {
      const op = opTypes[i % opTypes.length];
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const themeMeta = getItemTheme(theme);

      let n1 = 1;
      let n2 = 1;
      let correct: number | ComparisonSymbol = 0;
      let options: (number | ComparisonSymbol)[] = [];
      let explanation = '';
      let spoken = '';

      if (op === 'addition') {
        n1 = Math.floor(Math.random() * 5) + 1; // 1-5
        n2 = Math.floor(Math.random() * 5) + 1; // 1-5
        correct = n1 + n2;
        const optSet = new Set<number>([correct]);
        while (optSet.size < 4) {
          const fake = Math.max(1, correct + (Math.floor(Math.random() * 5) - 2));
          optSet.add(fake);
        }
        options = Array.from(optSet).sort(() => Math.random() - 0.5);
        explanation = `لدينا ${formatNum(n1, numeralSystem)} وضممنا إليها ${formatNum(n2, numeralSystem)} فكان المجموع ${formatNum(correct, numeralSystem)}!`;
        spoken = `${toArabicWords(n1)} زائد ${toArabicWords(n2)} يساوي ${toArabicWords(correct)}`;
      } else if (op === 'subtraction') {
        const top = Math.floor(Math.random() * 6) + 3; // 3-8
        const sub = Math.floor(Math.random() * (top - 1)) + 1;
        n1 = top;
        n2 = sub;
        correct = top - sub;
        const optSet = new Set<number>([correct]);
        while (optSet.size < 4) {
          const fake = Math.max(0, correct + (Math.floor(Math.random() * 5) - 2));
          optSet.add(fake);
        }
        options = Array.from(optSet).sort(() => Math.random() - 0.5);
        explanation = `كان لدينا ${formatNum(top, numeralSystem)} ${themeMeta.pluralName}، أخذنا منها ${formatNum(sub, numeralSystem)} فتبقّى ${formatNum(correct, numeralSystem)}!`;
        spoken = `${toArabicWords(top)} ناقص ${toArabicWords(sub)} يساوي ${toArabicWords(correct)}`;
      } else if (op === 'multiplication') {
        n1 = Math.floor(Math.random() * 3) + 2; // 2-4 groups
        n2 = Math.floor(Math.random() * 3) + 2; // 2-4 items each
        correct = n1 * n2;
        const optSet = new Set<number>([correct]);
        while (optSet.size < 4) {
          const fake = Math.max(2, correct + (Math.floor(Math.random() * 7) - 3));
          optSet.add(fake);
        }
        options = Array.from(optSet).sort(() => Math.random() - 0.5);
        explanation = `${formatNum(n1, numeralSystem)} مجموعات في كل منها ${formatNum(n2, numeralSystem)}، الناتج هو ${formatNum(correct, numeralSystem)}!`;
        spoken = `${toArabicWords(n1)} ضرب ${toArabicWords(n2)} يساوي ${toArabicWords(correct)}`;
      } else if (op === 'division') {
        const divisor = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const quotient = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
        const total = divisor * quotient;
        n1 = quotient;
        n2 = divisor;
        correct = quotient;
        const optSet = new Set<number>([correct]);
        while (optSet.size < 4) {
          const fake = Math.max(1, correct + (Math.floor(Math.random() * 4) - 2));
          optSet.add(fake);
        }
        options = Array.from(optSet).sort(() => Math.random() - 0.5);
        explanation = `وزعنا ${formatNum(total, numeralSystem)} بالتساوي على ${formatNum(divisor, numeralSystem)} أصدقاء، فنال كل واحد ${formatNum(correct, numeralSystem)}!`;
        spoken = `${toArabicWords(total)} تقسيم ${toArabicWords(divisor)} يساوي ${toArabicWords(correct)}`;
      } else {
        // Comparison
        n1 = Math.floor(Math.random() * 7) + 1;
        // make sure equals happens sometimes
        const roll = Math.random();
        if (roll < 0.3) {
          n2 = n1;
          correct = '=';
        } else if (roll < 0.65) {
          n2 = Math.max(1, n1 - (Math.floor(Math.random() * 3) + 1));
          correct = '>';
        } else {
          n2 = n1 + (Math.floor(Math.random() * 3) + 1);
          correct = '<';
        }
        options = ['>', '=', '<'];
        explanation =
          correct === '='
            ? `العددان متساويان: ${formatNum(n1, numeralSystem)} = ${formatNum(n2, numeralSystem)}`
            : correct === '>'
            ? `العدد الأول (${formatNum(n1, numeralSystem)}) أكبر من (${formatNum(n2, numeralSystem)})`
            : `العدد الأول (${formatNum(n1, numeralSystem)}) أصغر من (${formatNum(n2, numeralSystem)})`;
        spoken = `${toArabicWords(n1)} ${correct === '=' ? 'يساوي' : correct === '>' ? 'أكبر من' : 'أصغر من'} ${toArabicWords(n2)}`;
      }

      list.push({
        id: `prob-${i}-${Date.now()}`,
        operation: op,
        num1: n1,
        num2: n2,
        itemTheme: theme,
        correctAnswer: correct,
        options,
        explanationText: explanation,
        spokenArabic: spoken,
      });
    }

    return list;
  };

  // Start new round
  const startNewRound = (category: OperationKind | 'mixed') => {
    setSelectedCategory(category);
    const newProblems = generateProblems(category);
    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setScore(0);
    setStreak(0);
    setStars(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setRoundCompleted(false);
  };

  useEffect(() => {
    startNewRound(selectedCategory);
  }, []);

  const currentProblem = problems[currentProblemIndex];

  // Answer handler
  const handleAnswerSelect = (option: number | ComparisonSymbol) => {
    if (isAnswered || !currentProblem) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === currentProblem.correctAnswer;

    if (isCorrect) {
      soundManager.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((prev) => prev + 10 + newStreak * 2);

      // Star bonus every 3 streak
      if (newStreak % 3 === 0) {
        setStars((s) => s + 1);
      }

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });

      // Trigger badges if appropriate
      if (onBadgeUnlock && newStreak >= 3) {
        onBadgeUnlock('streak_master');
      }
    } else {
      soundManager.playWrong();
      setStreak(0);
    }
  };

  // Next question handler
  const handleNextProblem = () => {
    soundManager.playClick();
    if (currentProblemIndex + 1 < problems.length) {
      setCurrentProblemIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Completed all questions in the round
      soundManager.playCheer();
      setRoundCompleted(true);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
      if (onBadgeUnlock) {
        onBadgeUnlock('round_champion');
      }
      onTaskCompleted?.(
        `adventure:round:${selectedCategory}`,
        `إنهاء جولة المغامرة (${selectedCategory === 'mixed' ? 'مختلطة' : OPERATIONS_META[selectedCategory].title})`,
      );
    }
  };

  if (roundCompleted) {
    return (
      <div className="bg-white rounded-3xl border border-amber-200 p-6 sm:p-10 shadow-sm text-center space-y-6 max-w-xl mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-5xl animate-bounce">
          🏆
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">رائع يا بطل الأرقام!</h2>
          <p className="text-sm text-slate-600">أنهيت جولة التحدي بنجاح وتألق مبهر!</p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div>
            <div className="text-xs text-slate-500 font-bold mb-1">مجموع النقاط</div>
            <div className="text-2xl font-black text-amber-700">{formatNum(score, numeralSystem)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold mb-1">النجوم المكتسبة</div>
            <div className="text-2xl font-black text-amber-500 flex justify-center gap-1">
              <span>⭐</span>
              <span>{formatNum(stars + 3, numeralSystem)}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold mb-1">أطول سلسلة</div>
            <div className="text-2xl font-black text-emerald-600">🔥 {formatNum(streak, numeralSystem)}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => startNewRound(selectedCategory)}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md transition-all cursor-pointer"
          >
            لعب جولة أخرى 🔄
          </button>
          <button
            onClick={() => startNewRound('mixed')}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md transition-all cursor-pointer"
          >
            تحدي العباقرة الشامل 🚀
          </button>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return <div className="p-8 text-center text-slate-500">جارٍ إعداد المسائل...</div>;
  }

  const isCurrentCorrect = selectedAnswer === currentProblem.correctAnswer;
  const currentOpMeta = OPERATIONS_META[currentProblem.operation];
  const currentThemeMeta = getItemTheme(currentProblem.itemTheme);

  return (
    <div className="space-y-6">
      {/* Category selector row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'addition', label: 'الجمع +' },
              { id: 'subtraction', label: 'الطرح -' },
              { id: 'multiplication', label: 'الضرب ×' },
              { id: 'division', label: 'القسمة ÷' },
              { id: 'comparison', label: 'المقارنة ⚖️' },
              { id: 'mixed', label: 'تحدي شامل 🌟' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick();
                startNewRound(cat.id);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Score & Progress Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
            <span>النقاط:</span>
            <span className="font-black text-sm">{formatNum(score, numeralSystem)}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full animate-bounce">
              <span>🔥 متتالية:</span>
              <span>{formatNum(streak, numeralSystem)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        {/* Progress tracker */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
          <span>
            السؤال {formatNum(currentProblemIndex + 1, numeralSystem)} من {formatNum(problems.length, numeralSystem)}
          </span>
          <div className="flex gap-1">
            {problems.map((_, i) => (
              <span
                key={`p-dot-${i}`}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < currentProblemIndex
                    ? 'bg-emerald-500'
                    : i === currentProblemIndex
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Title & Equation */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            <span>{currentOpMeta.title}</span>
            <span>·</span>
            <span>بواسطة {currentThemeMeta.pluralName}</span>
          </div>

          {/* Large Problem representation in Eastern Arabic */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-3xl sm:text-4xl font-black text-slate-900 py-2">
            {currentProblem.operation === 'division' ? (
              <>
                <span className="bg-teal-50 text-teal-900 px-4 py-2 rounded-2xl border border-teal-200 shadow-xs">
                  {formatNum(currentProblem.num1 * currentProblem.num2, numeralSystem)}
                </span>
                <span className="text-teal-600 font-extrabold text-3xl">÷</span>
                <span className="bg-teal-50 text-teal-900 px-4 py-2 rounded-2xl border border-teal-200 shadow-xs">
                  {formatNum(currentProblem.num2, numeralSystem)}
                </span>
                <span className="text-slate-400">=</span>
                <span className="w-16 h-14 flex items-center justify-center bg-amber-100 text-amber-900 rounded-2xl border-2 border-dashed border-amber-400 shadow-inner">
                  {isAnswered ? formatNum(currentProblem.correctAnswer, numeralSystem) : '؟'}
                </span>
              </>
            ) : currentProblem.operation === 'comparison' ? (
              <>
                <span className="bg-purple-50 text-purple-900 px-4 py-2 rounded-2xl border border-purple-200 shadow-xs">
                  {formatNum(currentProblem.num1, numeralSystem)}
                </span>
                <span className="w-16 h-14 flex items-center justify-center bg-amber-100 text-amber-900 rounded-2xl border-2 border-dashed border-amber-400 shadow-inner text-2xl">
                  {isAnswered ? currentProblem.correctAnswer : '؟'}
                </span>
                <span className="bg-indigo-50 text-indigo-900 px-4 py-2 rounded-2xl border border-indigo-200 shadow-xs">
                  {formatNum(currentProblem.num2, numeralSystem)}
                </span>
              </>
            ) : (
              <>
                <span className="bg-amber-50 text-amber-900 px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
                  {formatNum(currentProblem.num1, numeralSystem)}
                </span>
                <span className="text-amber-600 font-extrabold text-3xl">{currentOpMeta.symbol}</span>
                <span className="bg-amber-50 text-amber-900 px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
                  {formatNum(currentProblem.num2, numeralSystem)}
                </span>
                <span className="text-slate-400">=</span>
                <span className="w-16 h-14 flex items-center justify-center bg-amber-100 text-amber-900 rounded-2xl border-2 border-dashed border-amber-400 shadow-inner">
                  {isAnswered ? formatNum(currentProblem.correctAnswer, numeralSystem) : '؟'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Visual Manipulative Concrete Example */}
        {showVisualAid && (
          <div className="pt-2">
            <VisualMathDisplay
              operation={currentProblem.operation}
              num1={currentProblem.num1}
              num2={currentProblem.num2}
              itemTheme={currentProblem.itemTheme}
              numeralSystem={numeralSystem}
              showNumbersBadges={true}
            />
          </div>
        )}

        {/* Answer Options */}
        <div className="space-y-3 pt-2">
          <div className="text-center text-xs font-bold text-slate-500">
            {currentProblem.operation === 'comparison'
              ? 'اختر الإشارة الصحيحة المناسبة:'
              : 'اختر الإجابة الصحيحة بالعدد المناسب:'}
          </div>

          <div
            className={`grid gap-3 ${
              currentProblem.operation === 'comparison' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {currentProblem.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectOption = opt === currentProblem.correctAnswer;

              let btnClasses =
                'bg-slate-50 hover:bg-amber-50 border-2 border-slate-200 text-slate-800 shadow-xs';

              if (isAnswered) {
                if (isCorrectOption) {
                  btnClasses = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md scale-102';
                } else if (isSelected) {
                  btnClasses = 'bg-rose-500 border-2 border-rose-600 text-white';
                } else {
                  btnClasses = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={`opt-${idx}`}
                  disabled={isAnswered}
                  onClick={() => handleAnswerSelect(opt)}
                  className={`h-16 rounded-2xl font-black text-2xl sm:text-3xl transition-all cursor-pointer flex items-center justify-center ${btnClasses}`}
                >
                  {typeof opt === 'number' ? formatNum(opt, numeralSystem) : opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Post-Answer Feedback & Next Button */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop">
            <div className="text-center sm:text-right">
              <div
                className={`font-black text-base sm:text-lg ${
                  isCurrentCorrect ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isCurrentCorrect ? '🎉 ممتاز جداً يا بطل! إجابة صحيحة!' : '💪 لا بأس، حاول في السؤال القادم!'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">{currentProblem.explanationText}</div>
            </div>

            <button
              onClick={handleNextProblem}
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md transition-all cursor-pointer text-base shrink-0"
            >
              {currentProblemIndex + 1 === problems.length ? 'إنهاء وحساب النجوم 🏆' : 'السؤال التالي ⬅️'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
