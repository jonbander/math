/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ItemTheme, NumeralSystem } from '../types/math';
import { formatNum } from '../utils/arabicNumerals';
import { soundManager } from '../utils/soundEffects';

interface ManipulativeIconProps {
  theme: ItemTheme;
  index?: number;
  showIndexBadge?: boolean;
  isStrikethrough?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  label?: string;
  numeralSystem?: NumeralSystem;
}

export const ManipulativeIcon: React.FC<ManipulativeIconProps> = ({
  theme,
  index,
  showIndexBadge = false,
  isStrikethrough = false,
  size = 'md',
  interactive = true,
  numeralSystem = 'eastern',
}) => {
  const [isTapped, setIsTapped] = useState(false);
  const [tapCounter, setTapCounter] = useState<number | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    soundManager.playPop();
    setIsTapped(true);
    if (index !== undefined) {
      setTapCounter(index);
    }
    setTimeout(() => {
      setIsTapped(false);
    }, 400);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-3xl',
    lg: 'w-16 h-16 text-4xl',
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-[10px] -top-1 -right-1',
    md: 'w-5 h-5 text-xs -top-1.5 -right-1.5',
    lg: 'w-6 h-6 text-sm -top-2 -right-2',
  };

  const renderIconSvg = () => {
    switch (theme) {
      case 'stars':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-400 drop-shadow-sm filter transition-transform hover:scale-110">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case 'pencils':
        return (
          <div className="w-full h-full flex items-center justify-center transition-transform hover:rotate-12">
            <span role="img" aria-label="قلم رصاص" className="select-none">✏️</span>
          </div>
        );
      case 'balls':
        return (
          <div className="w-full h-full flex items-center justify-center transition-transform hover:scale-110">
            <span role="img" aria-label="كرة" className="select-none">⚽</span>
          </div>
        );
      case 'apples':
        return (
          <div className="w-full h-full flex items-center justify-center transition-transform hover:scale-110">
            <span role="img" aria-label="تفاحة" className="select-none">🍎</span>
          </div>
        );
      case 'oranges':
        return (
          <div className="w-full h-full flex items-center justify-center transition-transform hover:scale-110">
            <span role="img" aria-label="برتقالة" className="select-none">🍊</span>
          </div>
        );
      case 'candies':
        return (
          <div className="w-full h-full flex items-center justify-center transition-transform hover:scale-110">
            <span role="img" aria-label="حلوى" className="select-none">🍬</span>
          </div>
        );
      default:
        return <span>⭐</span>;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none ${
        sizeClasses[size]
      } ${interactive ? 'cursor-pointer active:scale-90 transition-transform' : ''} ${
        isTapped ? 'scale-125' : ''
      } ${isStrikethrough ? 'opacity-40 grayscale-30' : ''}`}
      title={index !== undefined ? `العنصر رقم ${formatNum(index, numeralSystem)}` : undefined}
    >
      {renderIconSvg()}

      {/* Strikethrough for subtraction visualization */}
      {isStrikethrough && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-1 bg-rose-600 rounded-full rotate-45 transform drop-shadow" />
          <span className="absolute -bottom-1 text-[10px] font-bold text-rose-700 bg-white/90 px-1 rounded shadow-xs">
            أخذنا
          </span>
        </div>
      )}

      {/* Index badge showing count number (e.g. ١، ٢، ٣) */}
      {(showIndexBadge || tapCounter !== null) && index !== undefined && (
        <div
          className={`absolute rounded-full font-bold bg-amber-500 text-white flex items-center justify-center shadow-md border border-white pointer-events-none ${
            badgeSizeClasses[size]
          }`}
        >
          {formatNum(tapCounter ?? index, numeralSystem)}
        </div>
      )}
    </div>
  );
};
