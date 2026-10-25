/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import confetti from 'canvas-confetti';
import { ActiveAppMode, AchievementBadge, NumeralSystem } from './types/math';
import { soundManager } from './utils/soundEffects';
import { arabicSpeech, type SpeechStatus } from './utils/arabicSpeech';
import { Header } from './components/Header';
import { HomePageMenu } from './components/HomePageMenu';
import { NumberTracingCanvas } from './components/NumberTracingCanvas';
import { SimplifiedKidsMath } from './components/SimplifiedKidsMath';
import { InteractiveExploreLab } from './components/InteractiveExploreLab';
import { AdventureGameMode } from './components/AdventureGameMode';
import { InteractiveBalanceScale } from './components/InteractiveBalanceScale';
import { SpeedQuizMode } from './components/SpeedQuizMode';
import { BadgesModal } from './components/BadgesModal';
import { AboutPage } from './components/AboutPage';
import {
  addCompletedTask,
  clearSavedProgress,
  createEmptyProgress,
  loadProgress,
  saveProgress,
  type CompletedTask,
} from './utils/progressStorage';

const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'first_step',
    title: 'المستكشف الصغير',
    description: 'بدأ رحلة تعلم الأرقام والحساب',
    emoji: '🌱',
    unlocked: true,
    targetCount: 1,
    currentCount: 1,
  },
  {
    id: 'number_writer',
    title: 'خطّاط الأرقام الصغير',
    description: 'كتب وتتبع الأرقام من ١ إلى ١٠ بالفرشاة',
    emoji: '✏️',
    unlocked: false,
    targetCount: 10,
    currentCount: 0,
  },
  {
    id: 'addition_star',
    title: 'بطل الجمع البسيط',
    description: 'أتقن قصص جمع التفاح والنجوم حتى ١٠',
    emoji: '➕',
    unlocked: false,
    targetCount: 5,
    currentCount: 0,
  },
  {
    id: 'subtraction_hero',
    title: 'عبقري الطرح',
    description: 'أتقن أخذ العناصر وحساب الباقي بمهارة',
    emoji: '➖',
    unlocked: false,
    targetCount: 5,
    currentCount: 0,
  },
  {
    id: 'scale_balance',
    title: 'حارس الميزان',
    description: 'أتقن إشارات الأكبر والأصغر واليساوي',
    emoji: '⚖️',
    unlocked: false,
    targetCount: 5,
    currentCount: 0,
  },
  {
    id: 'streak_master',
    title: 'سلسلة الانتصارات',
    description: 'أجاب عن ٣ أسئلة متتالية بشكل صحيح',
    emoji: '🔥',
    unlocked: false,
    targetCount: 3,
    currentCount: 0,
  },
  {
    id: 'round_champion',
    title: 'بطل الجولة الكاملة',
    description: 'أنهى جولة أسئلة كاملة بنجاح وتفوق',
    emoji: '🏆',
    unlocked: false,
    targetCount: 1,
    currentCount: 0,
  },
];

export default function App() {
  // Starts with 'home' as requested by the user:
  // "اريد جعل الصفحة الرئيسية خيارات الصفحات تعلم الجمع الميزان الى اخره"
  const [activeMode, setActiveMode] = useState<ActiveAppMode>('home');
  const [numeralSystem, setNumeralSystem] = useState<NumeralSystem>('eastern');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(soundManager.getMuted());
  const [progressAtStartup] = useState(() => loadProgress(INITIAL_BADGES));
  const [badges, setBadges] = useState<AchievementBadge[]>(progressAtStartup.badges);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(progressAtStartup.completedTasks);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');

  useEffect(() => {
    const unsubscribe = arabicSpeech.subscribe(setSpeechStatus);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    saveProgress({ badges, completedTasks });
  }, [badges, completedTasks]);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsSoundMuted(muted);
    arabicSpeech.setMuted(muted);
    if (!muted) {
      soundManager.playPop();
    }
  };

  const handleToggleNumeralSystem = () => {
    soundManager.playClick();
    setNumeralSystem((prev) => {
      if (prev === 'eastern') return 'both';
      if (prev === 'both') return 'western';
      return 'eastern';
    });
  };

  const handleBadgeUnlock = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === badgeId && !b.unlocked) {
          soundManager.playCheer();
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.3 },
          });
          setNotification(`🎉 مبارك! حصلت على وسام جديد: ${b.title}!`);
          setTimeout(() => setNotification(null), 4000);
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      })
    );
  };

  const handleTaskCompleted = (taskId: string, title: string) => {
    setCompletedTasks((previous) => addCompletedTask(previous, taskId, title));
  };

  const handleResetProgress = () => {
    const emptyProgress = createEmptyProgress(INITIAL_BADGES);
    clearSavedProgress();
    setBadges(emptyProgress.badges);
    setCompletedTasks(emptyProgress.completedTasks);
    setNotification('تم مسح التقدم والمهام المحفوظة على هذا الجهاز.');
    window.setTimeout(() => setNotification(null), 4000);
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800">
      {/* Toast Notification for Badge Unlock */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-pop border border-emerald-400">
          <span className="text-2xl">🏅</span>
          <span className="text-sm">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentMode={activeMode}
        onSelectMode={setActiveMode}
        numeralSystem={numeralSystem}
        onToggleNumeralSystem={handleToggleNumeralSystem}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        unlockedBadgesCount={unlockedCount}
      />

      {(speechStatus === 'needs-arabic-voice' || speechStatus === 'error') && (
        <div role="alert" aria-live="assertive" dir="rtl" className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-5xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {speechStatus === 'needs-arabic-voice'
                ? 'لا يتوفر صوت عربي مثبت على الجهاز. ثبّت بيانات النطق العربية من إعدادات تحويل النص إلى كلام ثم أعد المحاولة.'
                : 'تعذّر تشغيل النطق. تحقق من مستوى صوت الوسائط وخدمة تحويل النص إلى كلام العربية ثم أعد المحاولة.'}
            </span>
            {Capacitor.isNativePlatform() && (
              <button
                type="button"
                onClick={() => void arabicSpeech.openArabicVoiceInstaller()}
                className="shrink-0 rounded-lg bg-amber-700 px-3 py-2 font-bold text-white hover:bg-amber-800"
              >
                إعداد الصوت العربي
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Home Portal Menu */}
        {activeMode === 'home' && (
          <HomePageMenu
            onSelectMode={setActiveMode}
            numeralSystem={numeralSystem}
          />
        )}

        {/* 1. Tracing & Writing Numbers 1-10 */}
        {activeMode === 'tracing' && (
          <NumberTracingCanvas
            numeralSystem={numeralSystem}
            onProceedToMath={() => setActiveMode('addition')}
            onBadgeUnlock={handleBadgeUnlock}
            onTaskCompleted={handleTaskCompleted}
            onGoHome={() => setActiveMode('home')}
          />
        )}

        {/* 2. Addition Mode */}
        {activeMode === 'addition' && (
          <SimplifiedKidsMath
            numeralSystem={numeralSystem}
            initialTab="addition"
            onBadgeUnlock={handleBadgeUnlock}
            onTaskCompleted={handleTaskCompleted}
            onGoToScale={() => setActiveMode('scale')}
            onGoHome={() => setActiveMode('home')}
          />
        )}

        {/* 3. Subtraction Mode */}
        {activeMode === 'subtraction' && (
          <SimplifiedKidsMath
            numeralSystem={numeralSystem}
            initialTab="subtraction"
            onBadgeUnlock={handleBadgeUnlock}
            onTaskCompleted={handleTaskCompleted}
            onGoToScale={() => setActiveMode('scale')}
            onGoHome={() => setActiveMode('home')}
          />
        )}

        {/* 4. Balance Scale */}
        {activeMode === 'scale' && (
          <InteractiveBalanceScale
            numeralSystem={numeralSystem}
            onTaskCompleted={handleTaskCompleted}
            onGoHome={() => setActiveMode('home')}
          />
        )}

        {/* 5. Explore Lab */}
        {activeMode === 'explore' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveMode('home');
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>🏠</span>
                <span>الرئيسية</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMode('explore')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs cursor-pointer"
                >
                  المختبر التفاعلي 🔬
                </button>
                <button
                  onClick={() => setActiveMode('adventure')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  مغامرة التحدي 🏆
                </button>
                <button
                  onClick={() => setActiveMode('speedQuiz')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  تحدي الدقيقة ⚡
                </button>
              </div>
            </div>
            <InteractiveExploreLab numeralSystem={numeralSystem} />
          </div>
        )}

        {/* 6. Adventure Challenge Mode */}
        {activeMode === 'adventure' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveMode('home');
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>🏠</span>
                <span>الرئيسية</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMode('explore')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  المختبر التفاعلي 🔬
                </button>
                <button
                  onClick={() => setActiveMode('adventure')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs cursor-pointer"
                >
                  مغامرة التحدي 🏆
                </button>
                <button
                  onClick={() => setActiveMode('speedQuiz')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  تحدي الدقيقة ⚡
                </button>
              </div>
            </div>
            <AdventureGameMode
              numeralSystem={numeralSystem}
              onBadgeUnlock={handleBadgeUnlock}
              onTaskCompleted={handleTaskCompleted}
            />
          </div>
        )}

        {/* 7. Speed Quiz Mode */}
        {activeMode === 'speedQuiz' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveMode('home');
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>🏠</span>
                <span>الرئيسية</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMode('explore')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  المختبر التفاعلي 🔬
                </button>
                <button
                  onClick={() => setActiveMode('adventure')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  مغامرة التحدي 🏆
                </button>
                <button
                  onClick={() => setActiveMode('speedQuiz')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs cursor-pointer"
                >
                  تحدي الدقيقة ⚡
                </button>
              </div>
            </div>
            <SpeedQuizMode numeralSystem={numeralSystem} onTaskCompleted={handleTaskCompleted} />
          </div>
        )}

        {activeMode === 'about' && (
          <AboutPage
            onGoHome={() => setActiveMode('home')}
            completedTasks={completedTasks}
            unlockedBadgesCount={unlockedCount}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Badges Modal */}
      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        badges={badges}
        numeralSystem={numeralSystem}
      />

      {/* Educational Footer for Parents and Teachers */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-6 mt-12 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-700">
          💡 نصيحة تعليمية للأهل والمعلمين (عمر ٦ سنوات): ابدأ بجعل الطفل يتتبع الأرقام بيده وينطقها بصوت مرتفع، ثم انتقل للجمع والطرح بواسطة التفاح والكرات والنجوم لتثبيت مفهوم العدد.
        </p>
        <p className="text-slate-400">
          منهج الحساب الممتع للأبطال الصغار · كتابة الأرقام (١ - ١٠) · الجمع والطرح المبسط · ميزان المقارنة
        </p>
      </footer>
    </div>
  );
}
