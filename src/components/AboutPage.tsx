import React from 'react';
import { soundManager } from '../utils/soundEffects';

const APP_VERSION = '1.0.0';

interface AboutPageProps {
  onGoHome: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onGoHome }) => (
  <section dir="rtl" className="mx-auto max-w-2xl rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-sm sm:p-10">
    <button
      type="button"
      onClick={() => {
        soundManager.playClick();
        onGoHome();
      }}
      className="mb-6 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
    >
      🏠 العودة إلى الرئيسية
    </button>
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-3xl font-black text-white shadow">١٢٣</div>
      <h1 className="text-3xl font-black text-slate-900">حول التطبيق</h1>
      <p className="mt-3 text-lg font-bold text-amber-800">أبطال الرياضيات الصغار</p>
      <p className="mt-2 leading-8 text-slate-600">
        تطبيق تعليمي تفاعلي يساعد الأطفال على تعلّم كتابة الأعداد والجمع والطرح ومقارنة الأعداد من خلال اللعب والتمارين المصوّرة.
      </p>
      <div className="mx-auto mt-7 w-fit rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3 text-slate-700">
        <span className="font-bold">رقم النسخة:</span>{' '}
        <span dir="ltr" className="font-black text-amber-800">{APP_VERSION}</span>
      </div>
      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">تطوير وتوقيع</p>
        <p className="mt-1 text-2xl font-black text-slate-800">أحمد</p>
      </div>
    </div>
  </section>
);
