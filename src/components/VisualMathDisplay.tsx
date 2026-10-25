/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ComparisonSymbol, ItemTheme, NumeralSystem, OperationKind } from '../types/math';
import { formatNum, getItemTheme, toArabicWords, toEasternArabic } from '../utils/arabicNumerals';
import { ManipulativeIcon } from './ManipulativeIcon';

interface VisualMathDisplayProps {
  operation: OperationKind;
  num1: number;
  num2: number;
  itemTheme: ItemTheme;
  numeralSystem: NumeralSystem;
  showNumbersBadges?: boolean;
}

export const VisualMathDisplay: React.FC<VisualMathDisplayProps> = ({
  operation,
  num1,
  num2,
  itemTheme,
  numeralSystem,
  showNumbersBadges = true,
}) => {
  const [showItemCounters, setShowItemCounters] = useState(showNumbersBadges);
  const themeMeta = getItemTheme(itemTheme);

  // Helper arrays for rendering items
  const array1 = Array.from({ length: Math.max(0, num1) }, (_, i) => i + 1);
  const array2 = Array.from({ length: Math.max(0, num2) }, (_, i) => i + 1);

  // Render Addition
  const renderAddition = () => {
    const total = num1 + num2;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-white/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* First Group */}
          <div className="flex flex-col items-center bg-blue-50/70 border border-blue-200 p-3 sm:p-4 rounded-xl">
            <span className="text-xs sm:text-sm text-blue-700 font-bold mb-2">
              المجموعة الأولى ({formatNum(num1, numeralSystem)})
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-w-[180px] min-h-[50px] items-center">
              {array1.map((idx) => (
                <ManipulativeIcon
                  key={`add1-${idx}`}
                  theme={itemTheme}
                  index={idx}
                  showIndexBadge={showItemCounters}
                  numeralSystem={numeralSystem}
                  size="md"
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 mt-2">
              {formatNum(num1, numeralSystem)} {num1 === 1 ? themeMeta.name : themeMeta.pluralName}
            </span>
          </div>

          {/* Plus Sign */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs">
              +
            </div>
            <span className="text-xs text-blue-600 font-medium mt-1">نَضُمّ</span>
          </div>

          {/* Second Group */}
          <div className="flex flex-col items-center bg-amber-50/70 border border-amber-200 p-3 sm:p-4 rounded-xl">
            <span className="text-xs sm:text-sm text-amber-700 font-bold mb-2">
              المجموعة الثانية ({formatNum(num2, numeralSystem)})
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-w-[180px] min-h-[50px] items-center">
              {array2.map((idx) => (
                <ManipulativeIcon
                  key={`add2-${idx}`}
                  theme={itemTheme}
                  index={idx}
                  showIndexBadge={showItemCounters}
                  numeralSystem={numeralSystem}
                  size="md"
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 mt-2">
              {formatNum(num2, numeralSystem)} {num2 === 1 ? themeMeta.name : themeMeta.pluralName}
            </span>
          </div>

          {/* Equals Sign */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs">
              =
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-1">يُساوي</span>
          </div>

          {/* Result Group (Combined) */}
          <div className="flex flex-col items-center bg-emerald-50/70 border border-emerald-300 p-3 sm:p-4 rounded-xl">
            <span className="text-xs sm:text-sm text-emerald-800 font-bold mb-2">
              المجموع الكلي ({formatNum(total, numeralSystem)})
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-w-[220px] min-h-[50px] items-center">
              {Array.from({ length: total }, (_, i) => (
                <ManipulativeIcon
                  key={`sum-${i}`}
                  theme={itemTheme}
                  index={i + 1}
                  showIndexBadge={showItemCounters}
                  numeralSystem={numeralSystem}
                  size="sm"
                />
              ))}
            </div>
            <span className="text-xs text-slate-600 font-medium mt-2">
              {formatNum(total, numeralSystem)} {themeMeta.pluralName} معاً!
            </span>
          </div>
        </div>

        {/* Narrative explanation */}
        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center text-sm text-blue-900">
          💡 <span className="font-bold">الشرح:</span> كان لدينا {toArabicWords(num1)} {num1 === 1 ? themeMeta.name : themeMeta.pluralName}، وأضفنا إليها {toArabicWords(num2)} أخرى، فأصبح معنا جميعاً <span className="font-extrabold text-blue-700">{formatNum(total, numeralSystem)}</span> {themeMeta.pluralName}!
        </div>
      </div>
    );
  };

  // Render Subtraction
  const renderSubtraction = () => {
    // Ensure num1 >= num2 for simple positive subtraction
    const top = Math.max(num1, num2);
    const bottom = Math.min(num1, num2);
    const remainder = top - bottom;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-white/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Initial items showing crossed out */}
          <div className="flex flex-col items-center bg-rose-50/70 border border-rose-200 p-3 sm:p-4 rounded-xl">
            <span className="text-xs sm:text-sm text-rose-800 font-bold mb-2">
              العدد الأصلي: {formatNum(top, numeralSystem)} {themeMeta.pluralName}
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-w-[240px] min-h-[50px] items-center">
              {Array.from({ length: top }, (_, idx) => {
                const isCrossed = idx >= remainder;
                return (
                  <ManipulativeIcon
                    key={`sub-${idx}`}
                    theme={itemTheme}
                    index={idx + 1}
                    showIndexBadge={showItemCounters}
                    isStrikethrough={isCrossed}
                    numeralSystem={numeralSystem}
                    size="md"
                  />
                );
              })}
            </div>
            <span className="text-xs text-rose-600 mt-2 font-medium">
              أخذنا منها {formatNum(bottom, numeralSystem)} المشطوبة
            </span>
          </div>

          {/* Minus & Equals flow */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs">
              -
            </div>
            <div className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg">
              {formatNum(bottom, numeralSystem)}
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs">
              =
            </div>
          </div>

          {/* Remainder */}
          <div className="flex flex-col items-center bg-emerald-50/70 border border-emerald-300 p-3 sm:p-4 rounded-xl">
            <span className="text-xs sm:text-sm text-emerald-800 font-bold mb-2">
              الباقي لدينا ({formatNum(remainder, numeralSystem)})
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-w-[180px] min-h-[50px] items-center">
              {Array.from({ length: remainder }, (_, i) => (
                <ManipulativeIcon
                  key={`rem-${i}`}
                  theme={itemTheme}
                  index={i + 1}
                  showIndexBadge={showItemCounters}
                  numeralSystem={numeralSystem}
                  size="md"
                />
              ))}
              {remainder === 0 && (
                <span className="text-sm text-slate-400 font-bold py-2">لا شيء متبقي (٠)</span>
              )}
            </div>
            <span className="text-xs text-slate-600 font-medium mt-2">
              {formatNum(remainder, numeralSystem)} {remainder === 1 ? themeMeta.name : themeMeta.pluralName} فقط!
            </span>
          </div>
        </div>

        {/* Narrative explanation */}
        <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-center text-sm text-rose-900">
          💡 <span className="font-bold">الشرح:</span> كان في يدنا {toArabicWords(top)} {themeMeta.pluralName}، أخذنا وأنقصنا منها {toArabicWords(bottom)}، فتبقّى معنا <span className="font-extrabold text-rose-700">{formatNum(remainder, numeralSystem)}</span> {remainder === 1 ? themeMeta.name : themeMeta.pluralName}!
        </div>
      </div>
    );
  };

  // Render Multiplication (Repeated Addition)
  const renderMultiplication = () => {
    // num1 groups, each with num2 items
    const groupsCount = Math.min(Math.max(1, num1), 6);
    const itemsPerGroup = Math.min(Math.max(1, num2), 6);
    const total = groupsCount * itemsPerGroup;

    return (
      <div className="space-y-4">
        <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="text-center font-bold text-amber-900 text-sm sm:text-base">
            الضرب هو تكرار المجموعات: {formatNum(groupsCount, numeralSystem)} مجموعات، في كل مجموعة {formatNum(itemsPerGroup, numeralSystem)} {themeMeta.pluralName}
          </div>

          {/* Groups Grid */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {Array.from({ length: groupsCount }, (_, gIdx) => (
              <div
                key={`group-${gIdx}`}
                className="flex flex-col items-center bg-amber-50/80 border-2 border-dashed border-amber-300 p-3 rounded-xl"
              >
                <div className="text-xs font-bold text-amber-800 mb-1.5">
                  المجموعة {formatNum(gIdx + 1, numeralSystem)}
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-[120px] items-center">
                  {Array.from({ length: itemsPerGroup }, (_, iIdx) => (
                    <ManipulativeIcon
                      key={`g-${gIdx}-i-${iIdx}`}
                      theme={itemTheme}
                      index={iIdx + 1}
                      showIndexBadge={showItemCounters}
                      numeralSystem={numeralSystem}
                      size="sm"
                    />
                  ))}
                </div>
                <div className="text-[11px] text-amber-700 mt-1 font-semibold">
                  {formatNum(itemsPerGroup, numeralSystem)} {themeMeta.pluralName}
                </div>
              </div>
            ))}
          </div>

          {/* Addition formula equivalence */}
          <div className="flex items-center justify-center flex-wrap gap-2 text-sm text-slate-700 bg-amber-100/50 p-2.5 rounded-lg border border-amber-200">
            <span className="font-medium">كأننا نجمع:</span>
            {Array.from({ length: groupsCount }, (_, idx) => (
              <React.Fragment key={`mult-add-${idx}`}>
                <span className="font-bold text-amber-900">{formatNum(itemsPerGroup, numeralSystem)}</span>
                {idx < groupsCount - 1 && <span className="font-bold text-amber-600">+</span>}
              </React.Fragment>
            ))}
            <span className="font-bold text-emerald-600">=</span>
            <span className="font-extrabold text-emerald-700 text-base">{formatNum(total, numeralSystem)}</span>
            <span className="text-xs text-slate-500">({themeMeta.pluralName})</span>
          </div>
        </div>

        {/* Narrative explanation */}
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-center text-sm text-amber-900">
          💡 <span className="font-bold">الشرح:</span> {formatNum(groupsCount, numeralSystem)} مرات من الرقم {formatNum(itemsPerGroup, numeralSystem)}، أي نكرر {toArabicWords(itemsPerGroup)} بمقدار {toArabicWords(groupsCount)} مرات لنحصل على <span className="font-extrabold text-amber-700">{formatNum(total, numeralSystem)}</span>!
        </div>
      </div>
    );
  };

  // Render Division (Fair Sharing)
  const renderDivision = () => {
    // dividend / divisor
    const divisor = Math.max(1, Math.min(num2, 5));
    // Pick dividend so it divides cleanly for clarity
    const quotient = Math.max(1, Math.min(num1, 5));
    const total = quotient * divisor;

    return (
      <div className="space-y-4">
        <div className="bg-white/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="text-center font-bold text-teal-900 text-sm sm:text-base">
            القسمة هي التوزيع العادل: نوزع {formatNum(total, numeralSystem)} {themeMeta.pluralName} بالتساوي على {formatNum(divisor, numeralSystem)} أصدقاء!
          </div>

          {/* Recipient Baskets / Friends */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {Array.from({ length: divisor }, (_, dIdx) => (
              <div
                key={`div-bask-${dIdx}`}
                className="flex flex-col items-center bg-teal-50/80 border-2 border-teal-300 p-3 rounded-2xl shadow-xs"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-teal-800 mb-2">
                  <span>الصديق {formatNum(dIdx + 1, numeralSystem)} 👦</span>
                </div>
                {/* Items in this friend's basket */}
                <div className="flex flex-wrap gap-1.5 justify-center max-w-[120px] min-h-[44px] items-center bg-white/70 p-2 rounded-xl border border-teal-200">
                  {Array.from({ length: quotient }, (_, qIdx) => (
                    <ManipulativeIcon
                      key={`div-q-${dIdx}-${qIdx}`}
                      theme={itemTheme}
                      index={qIdx + 1}
                      showIndexBadge={showItemCounters}
                      numeralSystem={numeralSystem}
                      size="sm"
                    />
                  ))}
                </div>
                <div className="text-xs font-extrabold text-teal-700 mt-2">
                  نصيبه: {formatNum(quotient, numeralSystem)} {quotient === 1 ? themeMeta.name : themeMeta.pluralName}
                </div>
              </div>
            ))}
          </div>

          {/* Formula summary */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-700 bg-teal-100/50 p-2.5 rounded-lg border border-teal-200">
            <span className="font-bold text-teal-900">{formatNum(total, numeralSystem)}</span>
            <span className="font-bold text-teal-600">÷</span>
            <span className="font-bold text-teal-900">{formatNum(divisor, numeralSystem)}</span>
            <span className="font-bold text-emerald-600">=</span>
            <span className="font-extrabold text-emerald-700 text-base">{formatNum(quotient, numeralSystem)}</span>
            <span className="text-xs text-slate-500">(نصيب كل واحد بالتساوي)</span>
          </div>
        </div>

        {/* Narrative explanation */}
        <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100 text-center text-sm text-teal-900">
          💡 <span className="font-bold">الشرح:</span> عندما وزعنا {formatNum(total, numeralSystem)} {themeMeta.pluralName} بالتساوي دون نقصان على {formatNum(divisor, numeralSystem)} أشخاص، أخذ كل شخص بالضبط <span className="font-extrabold text-teal-700">{formatNum(quotient, numeralSystem)}</span>!
        </div>
      </div>
    );
  };

  // Render Comparison (> < =)
  const renderComparison = () => {
    let symbol: ComparisonSymbol = '=';
    let comparisonTitle = 'يساوي';
    let comparisonExplanation = 'الطرفان متساويان تماماً!';

    if (num1 > num2) {
      symbol = '>';
      comparisonTitle = 'أكبر من (>)';
      comparisonExplanation = `الطرف الأيمن (${formatNum(num1, numeralSystem)}) أكثر من الطرف الأيسر (${formatNum(num2, numeralSystem)})`;
    } else if (num1 < num2) {
      symbol = '<';
      comparisonTitle = 'أصغر من (<)';
      comparisonExplanation = `الطرف الأيمن (${formatNum(num1, numeralSystem)}) أقل من الطرف الأيسر (${formatNum(num2, numeralSystem)})`;
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 bg-white/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Left Side Group */}
          <div className="flex flex-col items-center bg-purple-50/80 border border-purple-200 p-3 sm:p-4 rounded-xl min-w-[140px]">
            <span className="text-xs sm:text-sm text-purple-800 font-bold mb-2">
              الطرف الأيمن ({formatNum(num1, numeralSystem)})
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-w-[160px] min-h-[50px] items-center">
              {array1.map((idx) => (
                <ManipulativeIcon
                  key={`comp1-${idx}`}
                  theme={itemTheme}
                  index={idx}
                  showIndexBadge={showItemCounters}
                  numeralSystem={numeralSystem}
                  size="md"
                />
              ))}
              {num1 === 0 && <span className="text-xs text-slate-400 font-bold">صفر (لا يوجد)</span>}
            </div>
            <span className="text-xs text-slate-500 mt-2 font-medium">
              {formatNum(num1, numeralSystem)} {num1 === 1 ? themeMeta.name : themeMeta.pluralName}
            </span>
          </div>

          {/* Central Sign with Crocodile / Metaphor */}
          <div className="flex flex-col items-center justify-center px-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
              {symbol}
            </div>
            <span className="text-xs font-bold text-purple-700 mt-1.5">
              {comparisonTitle}
            </span>
          </div>

          {/* Right Side Group */}
          <div className="flex flex-col items-center bg-indigo-50/80 border border-indigo-200 p-3 sm:p-4 rounded-xl min-w-[140px]">
            <span className="text-xs sm:text-sm text-indigo-800 font-bold mb-2">
              الطرف الأيسر ({formatNum(num2, numeralSystem)})
            </span>
            <div className="flex flex-wrap gap-2 justify-center max-w-[160px] min-h-[50px] items-center">
              {array2.map((idx) => (
                <ManipulativeIcon
                  key={`comp2-${idx}`}
                  theme={itemTheme}
                  index={idx}
                  showIndexBadge={showItemCounters}
                  numeralSystem={numeralSystem}
                  size="md"
                />
              ))}
              {num2 === 0 && <span className="text-xs text-slate-400 font-bold">صفر (لا يوجد)</span>}
            </div>
            <span className="text-xs text-slate-500 mt-2 font-medium">
              {formatNum(num2, numeralSystem)} {num2 === 1 ? themeMeta.name : themeMeta.pluralName}
            </span>
          </div>
        </div>

        {/* Narrative & fun Crocodile Rule */}
        <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-center text-sm text-purple-900">
          🐊 <span className="font-bold">قاعدة التمساح الجائع:</span> التمساح يفتح فمه الكبير دائماً نحو العدد الأكثر! {comparisonExplanation}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Top Bar inside visual component for toggling individual counter badges */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-medium text-slate-500">
          تلميح: اضغط على أي {themeMeta.name} لسماع صوت العدّ!
        </span>
        <button
          onClick={() => setShowItemCounters(!showItemCounters)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline transition-colors cursor-pointer"
        >
          {showItemCounters ? 'إخفاء أرقام العدّ' : 'إظهار أرقام العدّ فوق العناصر'}
        </button>
      </div>

      {operation === 'addition' && renderAddition()}
      {operation === 'subtraction' && renderSubtraction()}
      {operation === 'multiplication' && renderMultiplication()}
      {operation === 'division' && renderDivision()}
      {operation === 'comparison' && renderComparison()}
    </div>
  );
};
