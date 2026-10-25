/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ItemTheme, NumeralSystem, OperationKind } from '../types/math';
import {
  formatNum,
  getItemTheme,
  MANIPULATIVE_ITEMS,
  OPERATIONS_META,
  toArabicWords,
} from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';
import { arabicSpeech } from '../utils/arabicSpeech';
import { VisualMathDisplay } from './VisualMathDisplay';

interface InteractiveExploreLabProps {
  numeralSystem: NumeralSystem;
}

export const InteractiveExploreLab: React.FC<InteractiveExploreLabProps> = ({ numeralSystem }) => {
  const [operation, setOperation] = useState<OperationKind>('addition');
  const [itemTheme, setItemTheme] = useState<ItemTheme>('stars');
  const [num1, setNum1] = useState<number>(3);
  const [num2, setNum2] = useState<number>(2);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentOpMeta = OPERATIONS_META[operation];
  const currentThemeMeta = getItemTheme(itemTheme);

  // Maximum limits for friendly child visual exploration
  const getMaxNum = (op: OperationKind) => {
    switch (op) {
      case 'multiplication':
        return 5; // to keep 5x5 grid reasonable on screen
      case 'division':
        return 6;
      default:
        return 9;
    }
  };

  const maxVal = getMaxNum(operation);

  // Compute result
  const computeResult = () => {
    switch (operation) {
      case 'addition':
        return num1 + num2;
      case 'subtraction':
        return Math.max(num1, num2) - Math.min(num1, num2);
      case 'multiplication':
        return num1 * num2;
      case 'division':
        return Math.floor(Math.max(1, num1) / Math.max(1, num2));
      case 'comparison':
        return num1 > num2 ? '>' : num1 < num2 ? '<' : '=';
      default:
        return 0;
    }
  };

  // Keep all spoken instructions on the shared native/web speech service.
  const handleSpeak = async () => {
    soundManager.playClick();
    let speechText = '';
    const n1Words = toArabicWords(num1);
    const n2Words = toArabicWords(num2);

    if (operation === 'addition') {
      const res = num1 + num2;
      speechText = `${n1Words} زائد ${n2Words} يساوي ${toArabicWords(res)}`;
    } else if (operation === 'subtraction') {
      const top = Math.max(num1, num2);
      const bot = Math.min(num1, num2);
      const res = top - bot;
      speechText = `${toArabicWords(top)} ناقص ${toArabicWords(bot)} يساوي ${toArabicWords(res)}`;
    } else if (operation === 'multiplication') {
      const res = num1 * num2;
      speechText = `${n1Words} ضرب ${n2Words} يساوي ${toArabicWords(res)}`;
    } else if (operation === 'division') {
      const divisor = Math.max(1, Math.min(num2, 5));
      const quotient = Math.max(1, Math.min(num1, 5));
      const total = quotient * divisor;
      speechText = `${toArabicWords(total)} تقسيم ${toArabicWords(divisor)} يساوي ${toArabicWords(quotient)}`;
    } else if (operation === 'comparison') {
      if (num1 > num2) {
        speechText = `${n1Words} أكبر من ${n2Words}`;
      } else if (num1 < num2) {
        speechText = `${n1Words} أصغر من ${n2Words}`;
      } else {
        speechText = `${n1Words} يساوي ${n2Words}`;
      }
    }

    setIsSpeaking(true);
    try {
      await arabicSpeech.speak(speechText, 0.85);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Preset fun examples
  const applyPreset = (op: OperationKind, t: ItemTheme, n1: number, n2: number) => {
    soundManager.playClick();
    setOperation(op);
    setItemTheme(t);
    setNum1(n1);
    setNum2(n2);
  };

  return (
    <div className="space-y-6">
      {/* Operation selector banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">مختبر العمليات الحسابية التفاعلي</h2>
            <p className="text-xs text-slate-500">
              اختر العملية والعنصر التوضيحي وغيّر الأرقام لتشاهد التمثيل البصري خطوة بخطوة
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">أمثلة جاهزة:</span>
            <button
              onClick={() => applyPreset('addition', 'stars', 3, 4)}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 cursor-pointer"
            >
              جمع النجوم (٣ + ٤)
            </button>
            <button
              onClick={() => applyPreset('subtraction', 'apples', 6, 2)}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 cursor-pointer"
            >
              طرح التفاح (٦ - ٢)
            </button>
            <button
              onClick={() => applyPreset('multiplication', 'pencils', 3, 2)}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 cursor-pointer"
            >
              ضرب الأقلام (٣ × ٢)
            </button>
            <button
              onClick={() => applyPreset('division', 'balls', 3, 2)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg border border-teal-200 cursor-pointer"
            >
              قسمة الكرات (٦ ÷ ٢)
            </button>
          </div>
        </div>

        {/* Operation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['addition', 'subtraction', 'multiplication', 'division', 'comparison'] as OperationKind[]).map((opKey) => {
            const meta = OPERATIONS_META[opKey];
            const isActive = operation === opKey;
            return (
              <button
                key={opKey}
                onClick={() => {
                  soundManager.playClick();
                  setOperation(opKey);
                  // Normalize numbers if exceeding limits
                  if (num1 > getMaxNum(opKey)) setNum1(getMaxNum(opKey));
                  if (num2 > getMaxNum(opKey)) setNum2(getMaxNum(opKey));
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm scale-102 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-xl font-black mb-1">{meta.symbol}</span>
                <span className="text-xs font-bold">{meta.title}</span>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                  {meta.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manipulatives Theme Bar (The examples requested: Stars, Pencils, Balls, Fruits, Candies) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="text-xs font-bold text-slate-500 mb-3">
          اختر وسيلة التوضيح والأمثلة البصرية:
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MANIPULATIVE_ITEMS.map((item) => {
            const isSelected = itemTheme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  setItemTheme(item.id);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? `${item.bgColor} border-2 shadow-xs font-bold scale-102`
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">{item.pluralName}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Number controls & Live Equation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4 border-b border-slate-100">
          {/* First Number Adjuster */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-2">
              {operation === 'division' ? 'مجموعات التوزيع' : operation === 'subtraction' ? 'العدد الأول' : 'العدد الأول'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setNum1(Math.max(1, num1 - 1));
                }}
                disabled={num1 <= 1}
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 font-extrabold text-slate-800 text-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
              >
                -
              </button>
              <div className="w-16 h-14 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-3xl font-black text-amber-900 shadow-inner">
                {formatNum(num1, numeralSystem)}
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setNum1(Math.min(maxVal, num1 + 1));
                }}
                disabled={num1 >= maxVal}
                className="w-10 h-10 rounded-xl bg-amber-500 text-white font-extrabold text-lg hover:bg-amber-600 disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>
            {/* Quick selector numbers 1-max */}
            <div className="flex gap-1 mt-2">
              {Array.from({ length: maxVal }, (_, i) => i + 1).map((n) => (
                <button
                  key={`q1-${n}`}
                  onClick={() => {
                    soundManager.playClick();
                    setNum1(n);
                  }}
                  className={`w-6 h-6 text-xs rounded-md font-bold cursor-pointer ${
                    num1 === n ? 'bg-amber-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {formatNum(n, numeralSystem)}
                </button>
              ))}
            </div>
          </div>

          {/* Central Operation Symbol */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 font-black text-3xl flex items-center justify-center shadow-xs">
              {currentOpMeta.symbol}
            </div>
            <span className="text-xs font-bold text-amber-800 mt-1">{currentOpMeta.title}</span>
          </div>

          {/* Second Number Adjuster */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-2">
              {operation === 'division' ? 'عدد الأصدقاء' : operation === 'subtraction' ? 'العدد المأخوذ' : 'العدد الثاني'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setNum2(Math.max(1, num2 - 1));
                }}
                disabled={num2 <= 1}
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 font-extrabold text-slate-800 text-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
              >
                -
              </button>
              <div className="w-16 h-14 rounded-xl bg-indigo-50 border-2 border-indigo-400 flex items-center justify-center text-3xl font-black text-indigo-900 shadow-inner">
                {formatNum(num2, numeralSystem)}
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setNum2(Math.min(maxVal, num2 + 1));
                }}
                disabled={num2 >= maxVal}
                className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-lg hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>
            {/* Quick selector numbers 1-max */}
            <div className="flex gap-1 mt-2">
              {Array.from({ length: maxVal }, (_, i) => i + 1).map((n) => (
                <button
                  key={`q2-${n}`}
                  onClick={() => {
                    soundManager.playClick();
                    setNum2(n);
                  }}
                  className={`w-6 h-6 text-xs rounded-md font-bold cursor-pointer ${
                    num2 === n ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {formatNum(n, numeralSystem)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Equation Display with Speech Synthesis */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">المعادلة:</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider">
              {operation === 'division' ? (
                <>
                  {formatNum(num1 * num2, numeralSystem)} ÷ {formatNum(num2, numeralSystem)} = {formatNum(num1, numeralSystem)}
                </>
              ) : operation === 'subtraction' ? (
                <>
                  {formatNum(Math.max(num1, num2), numeralSystem)} - {formatNum(Math.min(num1, num2), numeralSystem)} = {formatNum(Math.max(num1, num2) - Math.min(num1, num2), numeralSystem)}
                </>
              ) : operation === 'comparison' ? (
                <>
                  {formatNum(num1, numeralSystem)} {computeResult()} {formatNum(num2, numeralSystem)}
                </>
              ) : (
                <>
                  {formatNum(num1, numeralSystem)} {currentOpMeta.symbol} {formatNum(num2, numeralSystem)} = {formatNum(computeResult(), numeralSystem)}
                </>
              )}
            </span>
          </div>

          {/* Sound / Read Aloud Button */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <span>🔊</span>
            <span>{isSpeaking ? 'جارٍ القراءة...' : 'استمع للنطق بالعربية'}</span>
          </button>
        </div>

        {/* The Concrete Visual Display */}
        <VisualMathDisplay
          operation={operation}
          num1={num1}
          num2={num2}
          itemTheme={itemTheme}
          numeralSystem={numeralSystem}
        />
      </div>
    </div>
  );
};
