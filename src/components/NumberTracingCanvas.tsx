/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import confetti from 'canvas-confetti';
import { ItemTheme, NumeralSystem } from '../types/math';
import { formatNum, getItemTheme } from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';
import { arabicSpeech } from '../utils/arabicSpeech';
import { alphaToMask, matchHandwriting, type HandwritingPoint } from '../utils/handwritingMatcher';
import { ManipulativeIcon } from './ManipulativeIcon';

interface NumberTracingCanvasProps {
  numeralSystem: NumeralSystem;
  onProceedToMath?: () => void;
  onBadgeUnlock?: (id: string) => void;
  onGoHome?: () => void;
}

interface Point {
  x: number;
  y: number;
}

const GLYPH_FONT = '900 150px "Tajawal", "Readex Pro", sans-serif';


interface NumberGuide {
  num: number;
  easternChar: string;
  word: string;
  strokeHint: string;
  fingerEmoji: string;
  defaultTheme: ItemTheme;
}

// The same rendered glyph is used for the dotted tracing guide and answer evaluation.
const NUMBERS_GUIDES: NumberGuide[] = [
  {
    num: 1,
    easternChar: '١',
    word: 'واحد',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '☝️',
    defaultTheme: 'apples',
  },
  {
    num: 2,
    easternChar: '٢',
    word: 'اثنان',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '✌️',
    defaultTheme: 'stars',
  },
  {
    num: 3,
    easternChar: '٣',
    word: 'ثلاثة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '🤟',
    defaultTheme: 'pencils',
  },
  {
    num: 4,
    easternChar: '٤',
    word: 'أربعة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '🖐️',
    defaultTheme: 'balls',
  },
  {
    num: 5,
    easternChar: '٥',
    word: 'خمسة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '✋',
    defaultTheme: 'oranges',
  },
  {
    num: 6,
    easternChar: '٦',
    word: 'ستة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '✋☝️',
    defaultTheme: 'candies',
  },
  {
    num: 7,
    easternChar: '٧',
    word: 'سبعة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '✋✌️',
    defaultTheme: 'stars',
  },
  {
    num: 8,
    easternChar: '٨',
    word: 'ثمانية',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '✋🤟',
    defaultTheme: 'apples',
  },
  {
    num: 9,
    easternChar: '٩',
    word: 'تسعة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '✋🖐️',
    defaultTheme: 'pencils',
  },
  {
    num: 10,
    easternChar: '١٠',
    word: 'عشرة',
    strokeHint: 'تتبّع شكل الرقم المنقّط كاملاً بهدوء ✏️',
    fingerEmoji: '👐',
    defaultTheme: 'stars',
  },
];

export const NumberTracingCanvas: React.FC<NumberTracingCanvasProps> = ({
  numeralSystem,
  onProceedToMath,
  onBadgeUnlock,
  onGoHome,
}) => {
  const [currentNumIndex, setCurrentNumIndex] = useState<number>(0);
  const [brushColor, setBrushColor] = useState<string>('#3B82F6'); // blue
  const [brushSize] = useState<number>(16);
  const [pointsCount, setPointsCount] = useState<number>(0);
  const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);

  const currentNumIndexRef = useRef(currentNumIndex);
  currentNumIndexRef.current = currentNumIndex;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const strokesRef = useRef<HandwritingPoint[][]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const autoCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentGuide = NUMBERS_GUIDES[currentNumIndex];

  // Draw template lines and dotted numeral centered on 320x260 canvas
  const drawTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid guide notebook lines
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 35; y < canvas.height; y += 35) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Baseline
    ctx.strokeStyle = '#CBD5E1';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 + 55);
    ctx.lineTo(canvas.width, canvas.height / 2 + 55);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dotted large numeral outline for tracing
    ctx.font = GLYPH_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dotted trace
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    ctx.strokeText(currentGuide.easternChar, canvas.width / 2, canvas.height / 2 - 10);
    ctx.setLineDash([]);

    // Soft fill
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(currentGuide.easternChar, canvas.width / 2, canvas.height / 2 - 10);

  };

  useEffect(() => {
    if (autoCheckTimerRef.current) clearTimeout(autoCheckTimerRef.current);
    autoCheckTimerRef.current = null;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => drawTemplate());
    } else {
      drawTemplate();
    }
    strokesRef.current = [];
    lastPointRef.current = null;
    setPointsCount(0);
    setEvaluationStatus('idle');
    setAccuracyScore(null);
    if (Capacitor.isNativePlatform()) arabicSpeech.speakNumber(currentGuide.num);
  }, [currentNumIndex]);

  useEffect(() => () => {
    if (autoCheckTimerRef.current) clearTimeout(autoCheckTimerRef.current);
  }, []);

  // Touch and mouse coordinate helpers
  const getCanvasCoords = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (autoCheckTimerRef.current) clearTimeout(autoCheckTimerRef.current);
    autoCheckTimerRef.current = null;
    isDrawingRef.current = true;
    if (evaluationStatus === 'failed') {
      drawTemplate();
      strokesRef.current = [];
      setPointsCount(0);
    }
    setEvaluationStatus('idle');
    setAccuracyScore(null);
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasCoords(e.nativeEvent);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    soundManager.playClick();
    const startPoint = { x, y };
    strokesRef.current.push([startPoint]);
    lastPointRef.current = startPoint;
    setPointsCount(strokesRef.current.reduce((sum, stroke) => sum + stroke.length, 0));
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e.nativeEvent);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextPoint = { x, y };
    const previousPoint = lastPointRef.current ?? nextPoint;
    const distance = Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y);
    const steps = Math.max(1, Math.ceil(distance / 6));
    for (let step = 1; step <= steps; step++) {
      const ratio = step / steps;
      const point = {
        x: previousPoint.x + (nextPoint.x - previousPoint.x) * ratio,
        y: previousPoint.y + (nextPoint.y - previousPoint.y) * ratio,
      };
      ctx.lineTo(point.x, point.y);
      strokesRef.current[strokesRef.current.length - 1]?.push(point);
    }
    ctx.stroke();
    lastPointRef.current = nextPoint;
    setPointsCount(strokesRef.current.reduce((sum, stroke) => sum + stroke.length, 0));
  };

  /** Compare the child's drawn strokes with the rasterized outline shown on the canvas. */
  const performStrictEvaluation = async (showFailure = true) => {
    const evaluationNumIndex = currentNumIndex;
    try {
      await document.fonts?.ready;
    } catch {
      // Continue with the same system fallback font used by the canvas.
    }
    if (currentNumIndexRef.current !== evaluationNumIndex) return false;
    const canvas = canvasRef.current;
    const template = canvas ? document.createElement('canvas') : null;
    const templateCtx = template?.getContext('2d', { willReadFrequently: true });
    if (template && canvas && templateCtx) {
      template.width = canvas.width;
      template.height = canvas.height;
      templateCtx.font = GLYPH_FONT;
      templateCtx.textAlign = 'center';
      templateCtx.textBaseline = 'middle';
      templateCtx.lineCap = 'round';
      templateCtx.lineJoin = 'round';
      templateCtx.lineWidth = 4;
      templateCtx.strokeStyle = '#000';
      templateCtx.setLineDash([]);
      templateCtx.strokeText(currentGuide.easternChar, template.width / 2, template.height / 2 - 10);
    }

    const imageData = template && templateCtx
      ? templateCtx.getImageData(0, 0, template.width, template.height).data
      : null;
    const alpha = imageData ? new Uint8ClampedArray(template!.width * template!.height) : null;
    if (imageData && alpha) {
      for (let i = 0; i < alpha.length; i++) alpha[i] = imageData[i * 4 + 3];
    }
    const result = alpha
      ? matchHandwriting(strokesRef.current, alphaToMask(alpha), 320, 260, {
          brushRadius: brushSize / 2,
          tolerance: 10,
          minimumPathLength: 40,
          minimumCoverage: 0.7,
          minimumPrecision: 0.68,
          maximumStrokeCount: 3,
        })
      : { passed: false, score: 0, reason: 'missed-guide' as const };
    setAccuracyScore(result.score);
    const isPassing = result.passed;

    if (isPassing) {
      setEvaluationStatus('success');
      soundManager.playCorrect();
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
      });
      arabicSpeech.speak(`أنت بطل! كتبت الرقم ${currentGuide.word} بشكل صحيح وممتاز!`);

      if (onBadgeUnlock && currentGuide.num === 10) {
        onBadgeUnlock('number_writer');
      }
      return true;
    } else {
      if (showFailure) {
        setEvaluationStatus('failed');
        soundManager.playWrong();
        const feedback = result.reason === 'too-short'
          ? 'ارسم الرقم كاملاً قبل التحقق'
          : 'حاول مرة أخرى، تتبّع شكل الرقم المنقّط بالكامل';
        arabicSpeech.speak(`حاول مرة أخرى يا بطل! ${feedback}`);
      }
      return false;
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    if (autoCheckTimerRef.current) clearTimeout(autoCheckTimerRef.current);
    autoCheckTimerRef.current = setTimeout(() => {
      autoCheckTimerRef.current = null;
      void performStrictEvaluation(false);
    }, 1800);
  };

  // Reset and try again
  const handleRetry = () => {
    soundManager.playClick();
    drawTemplate();
    strokesRef.current = [];
    lastPointRef.current = null;
    setPointsCount(0);
    setEvaluationStatus('idle');
    setAccuracyScore(null);
  };

  // Next number
  const handleNextNumber = () => {
    soundManager.playClick();
    if (currentNumIndex + 1 < NUMBERS_GUIDES.length) {
      setCurrentNumIndex((prev) => prev + 1);
    } else if (onProceedToMath) {
      onProceedToMath();
    }
  };

  // Prev number
  const handlePrevNumber = () => {
    soundManager.playClick();
    if (currentNumIndex > 0) {
      setCurrentNumIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200 p-4 sm:p-6 shadow-xs space-y-6">
      {/* Top Header Row with Return to Home */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
              <span>✏️ تعليم كتابة الأعداد (عمر ٦ سنوات)</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mt-1">
              تعلّم كتابة ونطق الرقم ({currentGuide.easternChar}) - {currentGuide.word}
            </h2>
          </div>
        </div>

        {/* Speak Pronunciation Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            arabicSpeech.speakNumber(currentGuide.num);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-xs transition-all cursor-pointer"
        >
          <span className="text-lg">🔊</span>
          <span>استمع لنطق الرقم</span>
        </button>
      </div>

      {/* Number selector row: 1 to 10 */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-500">اختر الرقم للتعلّم والكتابة:</div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {NUMBERS_GUIDES.map((g, idx) => {
            const isSelected = idx === currentNumIndex;
            return (
              <button
                key={g.num}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentNumIndex(idx);
                }}
                className={`h-12 rounded-xl font-black text-xl sm:text-2xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md scale-105 border-2 border-amber-600'
                    : 'bg-slate-50 hover:bg-amber-50 border border-slate-200 text-slate-700'
                }`}
              >
                <span>{g.easternChar}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main interactive split: Canvas on one side, Visual items & Fingers on other side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Drawing Canvas Area (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3 w-full max-w-md mx-auto">
          {/* Stroke hint banner */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center text-xs font-bold text-blue-900">
            💡 {currentGuide.strokeHint}
          </div>

          {/* HORIZONTAL RESULT PANEL ABOVE THE WRITING CANVAS */}
          <div className="w-full min-h-[58px] flex items-center justify-center">
            {evaluationStatus === 'idle' && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span>✍️</span>
                  <span className="truncate">تتبّع الخط؛ سيفحص التطبيق كتابتك تلقائيًا بعد توقف قصير</span>
                </div>
                {pointsCount >= 8 && (
                  <button
                    onClick={() => void performStrictEvaluation()}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer shrink-0"
                  >
                    تحقق من خطي 🌟
                  </button>
                )}
              </div>
            )}

            {evaluationStatus === 'success' && (
              <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-2xl shadow-sm flex items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center text-lg font-black shrink-0">
                    ✓
                  </div>
                  <div className="min-w-0 text-right">
                    <div className="text-sm font-black truncate">أنت بطل! إتقان رائع يا ذكي! 🌟</div>
                    <div className="text-[11px] text-emerald-100 truncate">
                      كتبت الرقم {currentGuide.word} بشكل صحيح! (دقة: {accuracyScore ?? 90}%)
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextNumber}
                  className="px-3.5 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-xs shrink-0 cursor-pointer"
                >
                  الرقم التالي ⬅️
                </button>
              </div>
            )}

            {evaluationStatus === 'failed' && (
              <div className="w-full bg-rose-50 border-2 border-rose-300 p-2.5 sm:p-3 rounded-2xl shadow-xs flex items-center justify-between gap-2 animate-pop">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                    ✕
                  </div>
                  <div className="min-w-0 text-right">
                    <div className="text-xs sm:text-sm font-black text-rose-800">
                      لم تضبط! حاول مرة أخرى يا بطل
                    </div>
                    <div className="text-[10px] text-rose-600">
                      اتبع شكل الرقم المنقّط كاملاً دون خربشة خارجه
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRetry}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  إعادة المحاولة 🔄
                </button>
              </div>
            )}
          </div>

          {/* Centered Canvas Container */}
          <div className="w-full flex justify-center">
            <div className="relative border-4 border-amber-300 rounded-3xl bg-white shadow-inner overflow-hidden cursor-crosshair w-[320px] h-[260px] mx-auto select-none">
              <canvas
                ref={canvasRef}
                width={320}
                height={260}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                className="touch-none select-none block w-[320px] h-[260px]"
              />

              <div className="absolute top-2 left-2 text-[11px] font-black text-slate-400 select-none pointer-events-none">
                تتبّع الخط المنقّط
              </div>
            </div>
          </div>

          {/* Brush colors and controls bar below canvas */}
          <div className="w-full max-w-[320px] flex items-center justify-between gap-2 pt-1">
            {/* Color circles */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">لون القلم:</span>
              {[
                { color: '#3B82F6', label: 'أزرق' },
                { color: '#EF4444', label: 'أحمر' },
                { color: '#10B981', label: 'أخضر' },
                { color: '#F59E0B', label: 'أصفر' },
                { color: '#8B5CF6', label: 'بنفسجي' },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    soundManager.playClick();
                    setBrushColor(c.color);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    brushColor === c.color ? 'scale-125 border-slate-900 shadow-xs' : 'border-white'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>

            {/* Clear button */}
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              مسح اللوحة 🔄
            </button>
          </div>
        </div>

        {/* Visual Real World Aid (5 Cols): Real-world items & Fingers count */}
        <div className="lg:col-span-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-4 text-center w-full max-w-md mx-auto">
          <div>
            <div className="text-xs font-bold text-amber-800 mb-1">المدلول الحقيقي للعدد:</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900">
              {currentGuide.easternChar} = {currentGuide.word}
            </div>
          </div>

          {/* Finger counting representation */}
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <span className="text-xs font-bold text-slate-500 block mb-1">عدّ بأصابع يدك:</span>
            <div className="text-4xl">{currentGuide.fingerEmoji}</div>
            <span className="text-xs font-bold text-slate-700 mt-1 block">
              {formatNum(currentGuide.num, numeralSystem)} {currentGuide.num === 1 ? 'إصبع' : 'أصابع'}
            </span>
          </div>

          {/* Concrete visual manipulatives */}
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
            <span className="text-xs font-bold text-slate-500 block mb-2">
              المجموعة: ({formatNum(currentGuide.num, numeralSystem)}) من {getItemTheme(currentGuide.defaultTheme).pluralName}
            </span>
            <div className="flex flex-wrap gap-2 justify-center items-center min-h-[50px]">
              {Array.from({ length: currentGuide.num }, (_, i) => (
                <ManipulativeIcon
                  key={`trace-item-${i}`}
                  theme={currentGuide.defaultTheme}
                  index={i + 1}
                  showIndexBadge={true}
                  numeralSystem={numeralSystem}
                  size="md"
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              (المس أي عنصر لتسمع صوت العدّ!)
            </span>
          </div>

          {/* Navigation between numbers */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevNumber}
              disabled={currentNumIndex === 0}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
            >
              ➡️ الرقم السابق
            </button>

            {currentNumIndex + 1 < NUMBERS_GUIDES.length ? (
              <button
                onClick={handleNextNumber}
                className="px-4 py-2 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer"
              >
                الرقم التالي ({NUMBERS_GUIDES[currentNumIndex + 1].easternChar}) ⬅️
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.playCheer();
                  if (onProceedToMath) onProceedToMath();
                }}
                className="px-4 py-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
              >
                انتقل لتعلم الجمع 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
