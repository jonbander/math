/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ItemTheme, NumeralSystem } from '../types/math';
import { formatNum, getItemTheme, toArabicWords } from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';
import { arabicSpeech } from '../utils/arabicSpeech';
import { ManipulativeIcon } from './ManipulativeIcon';

interface SimplifiedKidsMathProps {
  numeralSystem: NumeralSystem;
  onBadgeUnlock?: (badgeId: string) => void;
  onTaskCompleted?: (id: string, title: string) => void;
  onGoToScale?: () => void;
  onGoHome?: () => void;
  initialTab?: 'addition' | 'subtraction';
}

interface SimpleStoryProblem {
  id: string;
  type: 'addition' | 'subtraction';
  theme: ItemTheme;
  num1: number;
  num2: number;
  storyTitle: string;
  storyText: string;
  questionText: string;
  correctAnswer: number;
}

// 24 Rich and varied illustrated stories for 6-year-old math
const RICH_SAMPLE_STORIES: SimpleStoryProblem[] = [
  // Addition stories
  {
    id: 'add-1',
    type: 'addition',
    theme: 'apples',
    num1: 2,
    num2: 1,
    storyTitle: 'سلة التفاح الشهي 🍎',
    storyText: 'كان في السلة تفاحتان حمراوان، ووضعت ماما تفاحة إضافية!',
    questionText: 'كم تفاحة أصبحت في السلة الآن؟',
    correctAnswer: 3,
  },
  {
    id: 'add-2',
    type: 'addition',
    theme: 'stars',
    num1: 3,
    num2: 2,
    storyTitle: 'النجوم المضيئة في السماء ⭐',
    storyText: 'في سماء الليل ٣ نجوم تلمع، وظهرت بجانبها نجمتان ساطعتان!',
    questionText: 'كم نجمة أصبحت تلمع في السماء؟',
    correctAnswer: 5,
  },
  {
    id: 'add-3',
    type: 'addition',
    theme: 'pencils',
    num1: 4,
    num2: 1,
    storyTitle: 'أقلام الرسم والتلوين ✏️',
    storyText: 'لدى أحمد ٤ أقلام رصاص، واشترى له والده قلماً جديداً!',
    questionText: 'كم قلماً أصبح في مقلمة أحمد؟',
    correctAnswer: 5,
  },
  {
    id: 'add-4',
    type: 'addition',
    theme: 'balls',
    num1: 3,
    num2: 3,
    storyTitle: 'كرات الملعب الرياضية ⚽',
    storyText: 'في الملعب ٣ كرات قدم، وجلب المدرب ٣ كرات أخرى!',
    questionText: 'كم كرة أصبحت في الملعب جميعاً؟',
    correctAnswer: 6,
  },
  {
    id: 'add-5',
    type: 'addition',
    theme: 'oranges',
    num1: 4,
    num2: 2,
    storyTitle: 'برتقال الحديقة المنعش 🍊',
    storyText: 'قطف ماجد ٤ برتقالات من الشجرة، وقطفت أخته سارة برتقالتين!',
    questionText: 'كم برتقالة قطف ماجد وسارة معاً؟',
    correctAnswer: 6,
  },
  {
    id: 'add-6',
    type: 'addition',
    theme: 'candies',
    num1: 5,
    num2: 2,
    storyTitle: 'قطع الحلوى اللذيذة 🍬',
    storyText: 'في الصحن ٥ قطع حلوى، وأضافت الجدة قطعتين من الحلوى!',
    questionText: 'كم قطعة حلوى أصبحت في الصحن؟',
    correctAnswer: 7,
  },
  {
    id: 'add-7',
    type: 'addition',
    theme: 'apples',
    num1: 4,
    num2: 3,
    storyTitle: 'شجرة الفواكه الطازجة 🍎',
    storyText: 'جمعنا ٤ تفاحات خضراء و ٣ تفاحات حمراء لذيذة!',
    questionText: 'ما هو مجموع التفاح الذي جمعناه؟',
    correctAnswer: 7,
  },
  {
    id: 'add-8',
    type: 'addition',
    theme: 'stars',
    num1: 5,
    num2: 3,
    storyTitle: 'نجوم التميز الذهبية ⭐',
    storyText: 'حصلت على ٥ نجوم في القراءة، ثم نلت ٣ نجوم إضافية في الرياضيات!',
    questionText: 'كم نجمة تفوق جمعت في لوحتك؟',
    correctAnswer: 8,
  },
  {
    id: 'add-9',
    type: 'addition',
    theme: 'pencils',
    num1: 4,
    num2: 4,
    storyTitle: 'علبة الألوان الخشبية ✏️',
    storyText: 'في العلبة الأولى ٤ أقلام تلوين، وفي العلبة الثانية ٤ أقلام أخرى!',
    questionText: 'كم قلماً في العلبتين معاً؟',
    correctAnswer: 8,
  },
  {
    id: 'add-10',
    type: 'addition',
    theme: 'balls',
    num1: 5,
    num2: 4,
    storyTitle: 'كرات السلة والرياضة ⚽',
    storyText: 'في الصالة الرياضية ٥ كرات كبيرة و ٤ كرات صغيرة!',
    questionText: 'كم كرة توجد في الصالة الرياضية؟',
    correctAnswer: 9,
  },
  {
    id: 'add-11',
    type: 'addition',
    theme: 'oranges',
    num1: 6,
    num2: 3,
    storyTitle: 'صندوق الفواكه الصباحي 🍊',
    storyText: 'وضع البائع ٦ برتقالات في الصندوق، ثم أضاف ٣ برتقالات ناضجة!',
    questionText: 'كم برتقالة أصبحت في الصندوق؟',
    correctAnswer: 9,
  },
  {
    id: 'add-12',
    type: 'addition',
    theme: 'candies',
    num1: 5,
    num2: 5,
    storyTitle: 'حلوى العيد والاحتفال 🍬',
    storyText: 'أخذ فادي ٥ قطع حلوى، وأخذت أخته ندى ٥ قطع حلوى مثلها!',
    questionText: 'كم قطعة حلوى معهما جميعاً؟',
    correctAnswer: 10,
  },

  // Subtraction stories
  {
    id: 'sub-1',
    type: 'subtraction',
    theme: 'stars',
    num1: 4,
    num2: 1,
    storyTitle: 'النجوم خلف الغيم ⭐',
    storyText: 'كانت في السماء ٤ نجوم لامعة، اختبأت نجمة واحدة خلف الغيمة!',
    questionText: 'كم نجمة تبقت تلمع في السماء؟',
    correctAnswer: 3,
  },
  {
    id: 'sub-2',
    type: 'subtraction',
    theme: 'apples',
    num1: 5,
    num2: 2,
    storyTitle: 'شجرة التفاح الأحمر 🍎',
    storyText: 'كان على الغصن ٥ تفاحات حمراء، سقطت منها تفاحتان على العشب!',
    questionText: 'كم تفاحة تبقت معلقة على الغصن؟',
    correctAnswer: 3,
  },
  {
    id: 'sub-3',
    type: 'subtraction',
    theme: 'pencils',
    num1: 6,
    num2: 2,
    storyTitle: 'علبة الأقلام المدرسية ✏️',
    storyText: 'كان في علبة أحمد ٦ أقلام رصاص، استعار صديقه قلمين منها!',
    questionText: 'كم قلماً بقي في علبة أحمد؟',
    correctAnswer: 4,
  },
  {
    id: 'sub-4',
    type: 'subtraction',
    theme: 'candies',
    num1: 5,
    num2: 3,
    storyTitle: 'قطع الحلوى الطيبة 🍬',
    storyText: 'كان لدينا ٥ قطع حلوى لذيذة، أكلنا منها ٣ قطع مع الشاي!',
    questionText: 'كم قطعة حلوى متبقية في الصحن؟',
    correctAnswer: 2,
  },
  {
    id: 'sub-5',
    type: 'subtraction',
    theme: 'balls',
    num1: 6,
    num2: 3,
    storyTitle: 'كرات الملعب الرياضي ⚽',
    storyText: 'كان في الملعب ٦ كرات قدم، أخذ الفريق ٣ كرات لبدء المباراة!',
    questionText: 'كم كرة ظلت في الصندوق؟',
    correctAnswer: 3,
  },
  {
    id: 'sub-6',
    type: 'subtraction',
    theme: 'oranges',
    num1: 7,
    num2: 3,
    storyTitle: 'عصير البرتقال الطازج 🍊',
    storyText: 'كان في السلة ٧ برتقالات، عصرنا منها ٣ برتقالات لتحضير العصير!',
    questionText: 'كم برتقالة كاملة بقيت في السلة؟',
    correctAnswer: 4,
  },
  {
    id: 'sub-7',
    type: 'subtraction',
    theme: 'apples',
    num1: 7,
    num2: 2,
    storyTitle: 'سلة التفاح المقرمش 🍎',
    storyText: 'اشترت أمي ٧ تفاحات لذيذة، أكلنا منها تفاحتين بعد الغداء!',
    questionText: 'كم تفاحة متبقية في السلة؟',
    correctAnswer: 5,
  },
  {
    id: 'sub-8',
    type: 'subtraction',
    theme: 'stars',
    num1: 8,
    num2: 3,
    storyTitle: 'نجوم التزيين الملونة ⭐',
    storyText: 'كان معنا ٨ نجوم ورقية جميلة، علّقنا منها ٣ على الجدار!',
    questionText: 'كم نجمة ورقية بقيت في يدنا؟',
    correctAnswer: 5,
  },
  {
    id: 'sub-9',
    type: 'subtraction',
    theme: 'pencils',
    num1: 8,
    num2: 4,
    storyTitle: 'أقلام التلوين الخشبية ✏️',
    storyText: 'كان في العلبة ٨ أقلام ملونة، استخدمنا ٤ أقلام لرسم اللوحة!',
    questionText: 'كم قلماً بقي داخل العلبة؟',
    correctAnswer: 4,
  },
  {
    id: 'sub-10',
    type: 'subtraction',
    theme: 'candies',
    num1: 9,
    num2: 4,
    storyTitle: 'حلوى المناسبات والأعياد 🍬',
    storyText: 'كان في الكيس ٩ قطع حلوى، وزعنا منها ٤ قطع على الأطفال!',
    questionText: 'كم قطعة حلوى تبقت في الكيس؟',
    correctAnswer: 5,
  },
  {
    id: 'sub-11',
    type: 'subtraction',
    theme: 'oranges',
    num1: 9,
    num2: 3,
    storyTitle: 'برتقال الحديقة الغنّاء 🍊',
    storyText: 'كان في الصندوق ٩ برتقالات، أهدى الجد ٣ برتقالات للجيران!',
    questionText: 'كم برتقالة بقيت في الصندوق؟',
    correctAnswer: 6,
  },
  {
    id: 'sub-12',
    type: 'subtraction',
    theme: 'balls',
    num1: 10,
    num2: 4,
    storyTitle: 'كرات الألعاب الممتعة ⚽',
    storyText: 'كان في المتجر ١٠ كرات ملونة، اشترى الأصدقاء ٤ كرات منها!',
    questionText: 'كم كرة بقيت في المتجر؟',
    correctAnswer: 6,
  },
];

export const SimplifiedKidsMath: React.FC<SimplifiedKidsMathProps> = ({
  numeralSystem,
  onBadgeUnlock,
  onTaskCompleted,
  onGoToScale,
  onGoHome,
  initialTab = 'addition',
}) => {
  const [activeTab, setActiveTab] = useState<'addition' | 'subtraction'>(initialTab);
  const [storyIndex, setStoryIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(0);

  // Customizer / Editor Mode state
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customNum1, setCustomNum1] = useState<number>(3);
  const [customNum2, setCustomNum2] = useState<number>(2);
  const [customTheme, setCustomTheme] = useState<ItemTheme>('apples');

  // Filter stories by active operation tab
  const filteredStories = RICH_SAMPLE_STORIES.filter((s) => s.type === activeTab);

  // Current problem: either preset story or custom-generated story
  const currentStory: SimpleStoryProblem = isCustomMode
    ? {
        id: `custom-${customNum1}-${customNum2}`,
        type: activeTab,
        theme: customTheme,
        num1: activeTab === 'addition' ? customNum1 : Math.max(customNum1, customNum2),
        num2: activeTab === 'addition' ? customNum2 : Math.min(customNum1, customNum2),
        storyTitle: `مسألتك المخصصة 🛠️ (${getItemTheme(customTheme).pluralName})`,
        storyText:
          activeTab === 'addition'
            ? `كان لدينا ${formatNum(customNum1, numeralSystem)} من ${getItemTheme(customTheme).pluralName}، وأضفنا إليها ${formatNum(customNum2, numeralSystem)} أخرى!`
            : `كان لدينا ${formatNum(Math.max(customNum1, customNum2), numeralSystem)} من ${getItemTheme(customTheme).pluralName}، وأخذنا منها ${formatNum(Math.min(customNum1, customNum2), numeralSystem)}!`,
        questionText:
          activeTab === 'addition'
            ? `كم أصبح المجموع الإجمالي لـ ${getItemTheme(customTheme).pluralName}؟`
            : `كم تبقّى لدينا من ${getItemTheme(customTheme).pluralName}؟`,
        correctAnswer:
          activeTab === 'addition'
            ? customNum1 + customNum2
            : Math.max(customNum1, customNum2) - Math.min(customNum1, customNum2),
      }
    : filteredStories[storyIndex % filteredStories.length];

  // Options generator (3 options: child friendly, not overwhelming)
  const generateOptions = (correct: number) => {
    const opts = new Set<number>([correct]);
    if (correct > 1) opts.add(correct - 1);
    opts.add(correct + 1);
    while (opts.size < 3) {
      opts.add(correct + 2);
    }
    return Array.from(opts).sort((a, b) => a - b);
  };

  const options = generateOptions(currentStory.correctAnswer);

  const handleSelectOption = (opt: number) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentStory.correctAnswer) {
      soundManager.playCorrect();
      setStarsEarned((s) => s + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      arabicSpeech.speak(`ممتاز يا بطل! الإجابة ${formatNum(opt, numeralSystem)} صحيحة تماماً!`);

      if (onBadgeUnlock) {
        if (activeTab === 'addition') onBadgeUnlock('addition_star');
        if (activeTab === 'subtraction') onBadgeUnlock('subtraction_hero');
      }
      onTaskCompleted?.(
        `${activeTab}:${currentStory.id}`,
        `${activeTab === 'addition' ? 'مسألة جمع' : 'مسألة طرح'}: ${currentStory.storyTitle}`,
      );
    } else {
      soundManager.playWrong();
      arabicSpeech.speak('حاول مرة أخرى! انظر إلى العناصر وعدّها بأصابعك');
    }
  };

  const handleNextStory = () => {
    soundManager.playClick();
    setSelectedOption(null);
    setIsAnswered(false);
    if (isCustomMode) {
      // In custom mode, generate a fun random next problem
      if (activeTab === 'addition') {
        setCustomNum1(Math.floor(Math.random() * 5) + 1);
        setCustomNum2(Math.floor(Math.random() * 4) + 1);
      } else {
        const top = Math.floor(Math.random() * 6) + 3;
        const sub = Math.floor(Math.random() * (top - 1)) + 1;
        setCustomNum1(top);
        setCustomNum2(sub);
      }
    } else {
      setStoryIndex((prev) => (prev + 1) % filteredStories.length);
    }
  };

  const handleRandomize = () => {
    soundManager.playClick();
    setSelectedOption(null);
    setIsAnswered(false);
    if (!isCustomMode) {
      setStoryIndex(Math.floor(Math.random() * filteredStories.length));
    } else {
      const themes: ItemTheme[] = ['apples', 'stars', 'pencils', 'balls', 'oranges', 'candies'];
      setCustomTheme(themes[Math.floor(Math.random() * themes.length)]);
      if (activeTab === 'addition') {
        setCustomNum1(Math.floor(Math.random() * 5) + 1);
        setCustomNum2(Math.floor(Math.random() * 5) + 1);
      } else {
        const top = Math.floor(Math.random() * 6) + 3;
        const sub = Math.floor(Math.random() * (top - 1)) + 1;
        setCustomNum1(top);
        setCustomNum2(sub);
      }
    }
  };

  const handleSpeakStory = () => {
    soundManager.playClick();
    arabicSpeech.speak(`${currentStory.storyText} ${currentStory.questionText}`);
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200 p-4 sm:p-6 shadow-xs space-y-6">
      {/* Header and age indicator */}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black mb-1">
              <span>🎒 تعلم الحساب المبسط (عمر ٦ سنوات)</span>
            </div>
            <h2 className="text-xl font-black text-slate-800">
              {activeTab === 'addition' ? 'تعلّم الجمع البسيط (+)' : 'تعلّم الطرح البسيط (-)'}
            </h2>
          </div>
        </div>

        {/* Operation mode switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('addition');
              setStoryIndex(0);
              setIsAnswered(false);
              setSelectedOption(null);
            }}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'addition'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الجمع (+) ➕
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('subtraction');
              setStoryIndex(0);
              setIsAnswered(false);
              setSelectedOption(null);
            }}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
              activeTab === 'subtraction'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الطرح (-) ➖
          </button>
        </div>
      </div>

      {/* Mode Controls: Example Navigator + Customizer Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          {/* Customizer Mode Toggle Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsCustomMode(!isCustomMode);
              setIsAnswered(false);
              setSelectedOption(null);
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isCustomMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-purple-900 border border-purple-200'
            }`}
          >
            <span>🛠️</span>
            <span>{isCustomMode ? 'العودة للقصص الجاهزة' : 'عدّل المسألة بنفسك'}</span>
          </button>

          {/* Random Question Button */}
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>🎲</span>
            <span>مسألة عشوائية</span>
          </button>
        </div>

        {/* Story Index Badge (when in preset mode) */}
        {!isCustomMode && (
          <div className="text-xs font-bold text-slate-500">
            مثال رقم {formatNum(storyIndex + 1, numeralSystem)} من {formatNum(filteredStories.length, numeralSystem)} أمثلة
          </div>
        )}
      </div>

      {/* Customizer / Editor Drawer (when active) */}
      {isCustomMode && (
        <div className="bg-purple-50/70 border-2 border-dashed border-purple-300 rounded-2xl p-4 sm:p-5 space-y-4 animate-pop">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-purple-900 flex items-center gap-1.5">
              <span>🛠️ صانع المسائل: اختر الأرقام والعناصر بنفسك!</span>
            </h3>
            <span className="text-[11px] text-purple-700 font-bold">
              تتحدث المسألة والرسومات تلقائياً
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Number 1 selector */}
            <div className="bg-white p-3 rounded-xl border border-purple-200 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 mb-1">
                {activeTab === 'addition' ? 'العدد الأول' : 'العدد الكلي'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCustomNum1(Math.max(1, customNum1 - 1));
                    setIsAnswered(false);
                    setSelectedOption(null);
                  }}
                  disabled={customNum1 <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-black text-purple-900 w-8 text-center">
                  {formatNum(customNum1, numeralSystem)}
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCustomNum1(Math.min(9, customNum1 + 1));
                    setIsAnswered(false);
                    setSelectedOption(null);
                  }}
                  disabled={customNum1 >= 9}
                  className="w-8 h-8 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Number 2 selector */}
            <div className="bg-white p-3 rounded-xl border border-purple-200 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 mb-1">
                {activeTab === 'addition' ? 'العدد المضاف' : 'العدد المنقوص'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCustomNum2(Math.max(1, customNum2 - 1));
                    setIsAnswered(false);
                    setSelectedOption(null);
                  }}
                  disabled={customNum2 <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-black text-purple-900 w-8 text-center">
                  {formatNum(customNum2, numeralSystem)}
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCustomNum2(Math.min(activeTab === 'subtraction' ? customNum1 - 1 : 9, customNum2 + 1));
                    setIsAnswered(false);
                    setSelectedOption(null);
                  }}
                  disabled={activeTab === 'subtraction' ? customNum2 >= customNum1 : customNum2 >= 9}
                  className="w-8 h-8 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Manipulative Theme Picker */}
            <div className="bg-white p-3 rounded-xl border border-purple-200 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-500 mb-1">العنصر التوضيحي</span>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {(['apples', 'stars', 'pencils', 'balls', 'oranges', 'candies'] as ItemTheme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      soundManager.playClick();
                      setCustomTheme(t);
                    }}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      customTheme === t ? 'bg-purple-100 border-2 border-purple-400 scale-110 shadow-xs' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                    title={getItemTheme(t).pluralName}
                  >
                    {getItemTheme(t).emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Problem Card */}
      <div className="bg-amber-50/50 border border-amber-200/90 rounded-2xl p-5 sm:p-6 space-y-4 text-center">
        {/* Story header with voice reader */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            {currentStory.storyTitle}
          </span>

          <button
            onClick={handleSpeakStory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
          >
            <span>🔊</span>
            <span>استمع للقصة</span>
          </button>
        </div>

        {/* Narrative text in clear large font */}
        <div className="space-y-1.5 max-w-xl mx-auto py-1">
          <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
            {currentStory.storyText}
          </p>
          <p className="text-sm sm:text-base font-black text-amber-900">
            {currentStory.questionText}
          </p>
        </div>

        {/* Concrete Manipulative Visual Aid */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          {activeTab === 'addition' ? (
            <>
              {/* Group 1 */}
              <div className="flex flex-col items-center bg-blue-50 p-3 rounded-xl border border-blue-200">
                <span className="text-xs font-bold text-blue-700 mb-1">
                  كان معنا ({formatNum(currentStory.num1, numeralSystem)})
                </span>
                <div className="flex flex-wrap gap-2 justify-center max-w-[180px]">
                  {Array.from({ length: currentStory.num1 }, (_, i) => (
                    <ManipulativeIcon
                      key={`sim-add-1-${i}`}
                      theme={currentStory.theme}
                      index={i + 1}
                      showIndexBadge={true}
                      numeralSystem={numeralSystem}
                      size="md"
                    />
                  ))}
                </div>
              </div>

              {/* Plus symbol */}
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-xs">
                +
              </div>

              {/* Group 2 */}
              <div className="flex flex-col items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-700 mb-1">
                  أضفنا ({formatNum(currentStory.num2, numeralSystem)})
                </span>
                <div className="flex flex-wrap gap-2 justify-center max-w-[180px]">
                  {Array.from({ length: currentStory.num2 }, (_, i) => (
                    <ManipulativeIcon
                      key={`sim-add-2-${i}`}
                      theme={currentStory.theme}
                      index={i + 1}
                      showIndexBadge={true}
                      numeralSystem={numeralSystem}
                      size="md"
                    />
                  ))}
                </div>
              </div>

              {/* Equals */}
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-xs">
                =
              </div>

              {/* Mystery Box */}
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-dashed border-amber-400 flex items-center justify-center text-3xl font-black text-amber-900 shadow-inner">
                {isAnswered ? formatNum(currentStory.correctAnswer, numeralSystem) : '؟'}
              </div>
            </>
          ) : (
            <>
              {/* Subtraction visualization */}
              <div className="flex flex-col items-center bg-rose-50 p-3 sm:p-4 rounded-xl border border-rose-200">
                <span className="text-xs font-bold text-rose-800 mb-2">
                  كان معنا {formatNum(currentStory.num1, numeralSystem)}، أخذنا منها {formatNum(currentStory.num2, numeralSystem)}:
                </span>
                <div className="flex flex-wrap gap-2 justify-center max-w-[260px]">
                  {Array.from({ length: currentStory.num1 }, (_, i) => {
                    const isRemoved = i >= currentStory.num1 - currentStory.num2;
                    return (
                      <ManipulativeIcon
                        key={`sim-sub-${i}`}
                        theme={currentStory.theme}
                        index={i + 1}
                        isStrikethrough={isRemoved}
                        showIndexBadge={!isRemoved}
                        numeralSystem={numeralSystem}
                        size="md"
                      />
                    );
                  })}
                </div>
              </div>

              {/* Equals */}
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-xs">
                =
              </div>

              {/* Mystery Box */}
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-dashed border-amber-400 flex items-center justify-center text-3xl font-black text-amber-900 shadow-inner">
                {isAnswered ? formatNum(currentStory.correctAnswer, numeralSystem) : '؟'}
              </div>
            </>
          )}
        </div>

        {/* Answer Buttons (3 choices - perfect for 6 year olds) */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-500">اختر العدد الصحيح:</div>
          <div className="flex items-center justify-center gap-3">
            {options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentStory.correctAnswer;

              let btnStyle =
                'bg-white hover:bg-amber-50 border-2 border-slate-300 text-slate-800 shadow-xs';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md scale-110';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-500 border-2 border-rose-600 text-white';
                } else {
                  btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-50';
                }
              }

              return (
                <button
                  key={`sim-opt-${opt}`}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-20 h-16 rounded-2xl font-black text-3xl transition-all cursor-pointer flex items-center justify-center ${btnStyle}`}
                >
                  {formatNum(opt, numeralSystem)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback & Next Button */}
        {isAnswered && (
          <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pop">
            <div className="text-center sm:text-right">
              {selectedOption === currentStory.correctAnswer ? (
                <div className="font-black text-emerald-800 text-base">
                  🎉 رائع وممتاز يا بطل! إجابة صحيحة!
                </div>
              ) : (
                <div className="font-bold text-rose-800 text-sm">
                  💪 لا بأس، يمكنك إعادة المحاولة في المسألة التالية!
                </div>
              )}
            </div>

            <button
              onClick={handleNextStory}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-xs transition-colors cursor-pointer"
            >
              المسألة التالية ⬅️
            </button>
          </div>
        )}
      </div>

      {/* Progress & Next step banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span>النجوم التي جمعتها:</span>
          <span className="text-amber-500 text-base">⭐ {formatNum(starsEarned, numeralSystem)}</span>
        </div>

        {onGoToScale && (
          <button
            onClick={onGoToScale}
            className="font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
          >
            الانتقال لتعلم ميزان المقارنة والأكبر والأصغر (⚖️) ⬅️
          </button>
        )}
      </div>
    </div>
  );
};
