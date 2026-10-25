/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveAppMode, NumeralSystem } from '../types/math';
import { soundManager } from '../utils/soundEffects';

interface HeroGuideProps {
  onStartMode: (mode: ActiveAppMode) => void;
  numeralSystem: NumeralSystem;
}

export const HeroGuide: React.FC<HeroGuideProps> = ({ onStartMode }) => {
  return (
    <div className="bg-gradient-to-b from-amber-100/70 via-amber-50/40 to-transparent rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-xs mb-6">
      <div className="max-w-3xl mx-auto text-center space-y-3.5">
        {/* Child friendly age banner */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-black text-amber-900 border border-amber-300 shadow-xs">
          <span>👶 مخصصة لعمر ٦ سنوات · رحلة خطوة بخطوة بالصوت والصورة</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          ابدأ بتعلم كتابة الأعداد من ١ إلى ١٠ ثم انطلق في الجمع والطرح!
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          تتبّع الأرقام بفرشاة الرسم اللطيفة، واستمع لنطق كل رقم بالعربية، ثم تدرّب على جمع وطرح النجوم
          والتفاح وأقلام الرصاص بالأرقام العربية
          <span className="font-extrabold text-amber-700 px-1">١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩، ١٠</span>.
        </p>

        {/* 3 Step Sequence for 6-Year-Olds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-right">
          {/* Step 1 */}
          <div
            onClick={() => {
              soundManager.playClick();
              onStartMode('tracing');
            }}
            className="bg-white/95 hover:bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-amber-600 group-hover:scale-110 transition-transform">
                ✏️
              </span>
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                الخطوة الأولى
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-1">١. كتابة الأعداد (١ - ١٠)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                تتبّع النقاط بيدك، واستمع لصوت الرقم، وعدّ بأصابع يدك!
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => {
              soundManager.playClick();
              onStartMode('addition');
            }}
            className="bg-white/95 hover:bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-blue-600 group-hover:scale-110 transition-transform">
                ➕ ➖
              </span>
              <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                الخطوة الثانية
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-1">٢. الجمع والطرح البسيط</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                قصص تفاعلية مصورة للتفاح والبالونات والأقلام حتى العدد ١٠.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => {
              soundManager.playClick();
              onStartMode('scale');
            }}
            className="bg-white/95 hover:bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-black text-purple-600 group-hover:scale-110 transition-transform">
                ⚖️
              </span>
              <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                الخطوة الثالثة
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-1">٣. ميزان المقارنة (&gt; = &lt;)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                شاهد الكفة الأثقل تميل، وتعرّف على فم التمساح الجائع!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartMode('tracing');
            }}
            className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-sm transition-all cursor-pointer"
          >
            ابدأ كتابة الأعداد بالصوت والفرشاة الآن! ✏️
          </button>
        </div>
      </div>
    </div>
  );
};
