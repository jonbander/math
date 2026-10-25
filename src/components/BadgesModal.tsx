/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AchievementBadge, NumeralSystem } from '../types/math';
import { formatNum } from '../utils/arabicNumerals';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: AchievementBadge[];
  numeralSystem: NumeralSystem;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
  numeralSystem,
}) => {
  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-pop">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800">أوسمة وجوائز البطل الصغير 🏅</h3>
            <p className="text-xs text-slate-500">
              حصلت على {formatNum(unlockedCount, numeralSystem)} من {formatNum(badges.length, numeralSystem)} أوسمة
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border text-right flex flex-col justify-between transition-all ${
                badge.unlocked
                  ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale-60'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{badge.emoji}</span>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{badge.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-2">{badge.description}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold mt-1 text-left">
                {badge.unlocked ? (
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    مُحقق ✓
                  </span>
                ) : (
                  <span className="text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                    قيد الإنجاز
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
          >
            متابعة اللعب 🎮
          </button>
        </div>
      </div>
    </div>
  );
};
