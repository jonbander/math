import React from 'react';
import { soundManager } from '../utils/soundEffects';
import type { CompletedTask } from '../utils/progressStorage';

const APP_VERSION = '1.0.3';

interface AboutPageProps {
  onGoHome: () => void;
  completedTasks: CompletedTask[];
  unlockedBadgesCount: number;
  onResetProgress: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onGoHome,
  completedTasks,
  unlockedBadgesCount,
  onResetProgress,
}) => (
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
      <section className="mx-auto mt-7 max-w-xl rounded-2xl border border-sky-200 bg-sky-50 p-5 text-right" aria-labelledby="saved-progress-heading">
        <h2 id="saved-progress-heading" className="text-lg font-black text-slate-800">تقدم الطفل على هذا الهاتف</h2>
        <p className="mt-2 text-sm text-slate-700">
          المهام المكتملة: <strong>{completedTasks.length}</strong> · الأوسمة المفتوحة: <strong>{unlockedBadgesCount}</strong>
        </p>
        {completedTasks.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {completedTasks.slice(0, 5).map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                <span>{task.title}</span>
                <time className="shrink-0 text-xs text-slate-500" dateTime={task.completedAt}>
                  {new Date(task.completedAt).toLocaleDateString('ar')}
                </time>
              </li>
            ))}
            {completedTasks.length > 5 && (
              <li className="text-xs text-slate-500">وتوجد {completedTasks.length - 5} مهام أخرى محفوظة.</li>
            )}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">لا توجد مهام مكتملة محفوظة بعد.</p>
        )}
        <p className="mt-3 text-xs leading-6 text-slate-500">
          يُحفظ التقدم محليًا على هذا الهاتف ولا يُرسل إلى الإنترنت. سيؤدي حذف التطبيق إلى حذف بياناته المحلية.
        </p>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            if (window.confirm('سيتم تصفير تقدم الطفل ومسح المهام المكتملة من هذا الهاتف فقط، ولا يمكن التراجع. هل تريد المتابعة؟')) {
              onResetProgress();
            }
          }}
          className="mt-4 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
        >
          مسح الذاكرة وتصفير المهام
        </button>
      </section>
      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">تطوير وتوقيع</p>
        <p className="mt-1 text-2xl font-black text-slate-800">أحمد</p>
      </div>
    </div>
  </section>
);
