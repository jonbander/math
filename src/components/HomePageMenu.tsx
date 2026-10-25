/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveAppMode, NumeralSystem } from '../types/math';
import { soundManager } from '../utils/soundEffects';

interface HomePageMenuProps {
  onSelectMode: (mode: ActiveAppMode) => void;
  numeralSystem: NumeralSystem;
}

interface MenuCardItem {
  id: ActiveAppMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  badgeColor: string;
  btnLabel: string;
  btnGradient: string;
  bgGradient: string;
  borderColor: string;
}

const MENU_CARDS: MenuCardItem[] = [
  {
    id: 'tracing',
    title: 'تعلم كتابة الأعداد (١ - ١٠)',
    subtitle: 'الخطوة الأولى بالصوت والفرشاة',
    description: 'تتبّع الأرقام بيدك، واستمع لنطق الرقم بالعربية، والتحقق التلقائي: (أنت بطل 🌟)!',
    icon: '✏️',
    badge: 'الخطوة الأولى',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    btnLabel: 'ابدأ الكتابة الآن ✏️',
    btnGradient: 'bg-amber-500 hover:bg-amber-600 text-white',
    bgGradient: 'from-amber-50 to-orange-50/40',
    borderColor: 'border-amber-300',
  },
  {
    id: 'addition',
    title: 'تعلم الجمع البسيط (+)',
    subtitle: 'ضم المجموعات بالأمثلة',
    description: 'قصص مصورة سهلة ومحببة لضم تفاحتين مع تفاحة وجمع النجوم والكرات حتى ١٠.',
    icon: '➕',
    badge: 'الجمع والمجموع',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    btnLabel: 'هيا نتعلّم الجمع ➕',
    btnGradient: 'bg-blue-500 hover:bg-blue-600 text-white',
    bgGradient: 'from-blue-50 to-indigo-50/40',
    borderColor: 'border-blue-300',
  },
  {
    id: 'subtraction',
    title: 'تعلم الطرح المرح (-)',
    subtitle: 'أخذ العناصر وحساب الباقي',
    description: 'شطب العناصر لمعرفة كم تبقى من البالونات والحلويات وأقلام الرصاص بأسلوب مسلٍ.',
    icon: '➖',
    badge: 'الطرح والباقي',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    btnLabel: 'هيا نتعلّم الطرح ➖',
    btnGradient: 'bg-rose-500 hover:bg-rose-600 text-white',
    bgGradient: 'from-rose-50 to-pink-50/40',
    borderColor: 'border-rose-300',
  },
  {
    id: 'scale',
    title: 'ميزان المقارنة (أكبر / أصغر / يساوي)',
    subtitle: 'الميزان ذو الكفتين وفم التمساح',
    description: 'شاهد الكفة الأثقل تميل للأرض وتعرف على إشارات المقارنة (> < =) بطريقة ملموسة.',
    icon: '⚖️',
    badge: 'مقارنة الأعداد',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    btnLabel: 'جرّب الميزان ⚖️',
    btnGradient: 'bg-purple-600 hover:bg-purple-700 text-white',
    bgGradient: 'from-purple-50 to-indigo-50/40',
    borderColor: 'border-purple-300',
  },
  {
    id: 'explore',
    title: 'مختبر الحساب التفاعلي',
    subtitle: 'الضرب والقسمة والوسائل التعليمية',
    description: 'غيّر الأرقام والوسائل (نجوم، أقلام، كرات، فواكه) بحرية واستمع لنطق المعادلات.',
    icon: '🔬',
    badge: 'استكشاف حر',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    btnLabel: 'دخول المختبر 🔬',
    btnGradient: 'bg-teal-600 hover:bg-teal-700 text-white',
    bgGradient: 'from-teal-50 to-emerald-50/40',
    borderColor: 'border-teal-300',
  },
  {
    id: 'adventure',
    title: 'مغامرة التحدي والمسابقات',
    subtitle: 'اجمع النجوم والأوسمة',
    description: 'جولات أسئلة مشوقة متدرجة مع احتفالات بالبالونات والأوسمة الذهبية للأبطال.',
    icon: '🏆',
    badge: 'تحدي الأذكياء',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    btnLabel: 'خوض التحدي 🎮',
    btnGradient: 'bg-amber-500 hover:bg-amber-600 text-white',
    bgGradient: 'from-yellow-50 to-amber-50/40',
    borderColor: 'border-yellow-300',
  },
  {
    id: 'speedQuiz',
    title: 'تحدي الدقيقة السريع ⚡',
    subtitle: '٦٠ ثانية من السرعة والذكاء',
    description: 'اختبار سريع لحل أكبر عدد من المسائل الحسابية وتطوير سرعة البديهة والعد.',
    icon: '⚡',
    badge: 'اختبار السرعة',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    btnLabel: 'ابدأ التحدي السريع ⚡',
    btnGradient: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    bgGradient: 'from-emerald-50 to-teal-50/40',
    borderColor: 'border-emerald-300',
  },
];

export const HomePageMenu: React.FC<HomePageMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="space-y-8 animate-pop">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-md text-center space-y-3 relative overflow-hidden">
        {/* Subtle background stars */}
        <div className="absolute top-2 right-4 text-3xl opacity-20 pointer-events-none">⭐</div>
        <div className="absolute bottom-2 left-6 text-4xl opacity-20 pointer-events-none">✨</div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black">
          <span>🌟 بوابة أبطال الرياضيات الصغار (عمر ٦ سنوات)</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug">
          أهلاً بك يا بطل! ماذا تريد أن تتعلّم وتلعب اليوم؟
        </h1>

        <p className="text-xs sm:text-sm text-amber-50 max-w-xl mx-auto font-medium">
          اختر أحد الأقسام التعليمية التالية لبدء رحلة التعلم الممتعة بالصوت والصورة والألعاب التفاعلية:
        </p>
      </div>

      {/* Grid of Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MENU_CARDS.map((card) => (
          <div
            key={card.id}
            onClick={() => {
              soundManager.playClick();
              onSelectMode(card.id);
            }}
            className={`bg-gradient-to-b ${card.bgGradient} bg-white rounded-3xl border-2 ${card.borderColor} p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group`}
          >
            <div className="space-y-3">
              {/* Card Top: Icon & Badge */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{card.subtitle}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{card.description}</p>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-4 mt-2">
              <button
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${card.btnGradient}`}
              >
                <span>{card.btnLabel}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
