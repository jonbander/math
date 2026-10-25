/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OperationKind = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'comparison';

export type ItemTheme = 'stars' | 'pencils' | 'balls' | 'apples' | 'oranges' | 'candies';

export type ComparisonSymbol = '>' | '<' | '=';

export type NumeralSystem = 'eastern' | 'western' | 'both';

export type GameDifficulty = 'level1' | 'level2' | 'level3'; // 1-5, 1-10, 1-20

export type ActiveAppMode = 'home' | 'tracing' | 'addition' | 'subtraction' | 'scale' | 'explore' | 'adventure' | 'speedQuiz';

export interface MathItemDefinition {
  id: ItemTheme;
  name: string;
  pluralName: string;
  icon: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface MathProblem {
  id: string;
  operation: OperationKind;
  num1: number;
  num2: number;
  itemTheme: ItemTheme;
  correctAnswer: number | ComparisonSymbol;
  options: (number | ComparisonSymbol)[];
  explanationText: string;
  spokenArabic: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
  targetCount: number;
  currentCount: number;
}
