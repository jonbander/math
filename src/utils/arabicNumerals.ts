/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ItemTheme, MathItemDefinition, NumeralSystem, OperationKind } from '../types/math';

const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts any number or string of digits to Eastern Arabic numerals (١، ٢، ٣، ٤...)
 */
export function toEasternArabic(value: number | string): string {
  const str = String(value);
  return str.replace(/[0-9]/g, (digit) => EASTERN_ARABIC_DIGITS[parseInt(digit, 10)]);
}

/**
 * Formats a number based on selected numeral system (Eastern by default)
 */
export function formatNum(value: number | string, system: NumeralSystem = 'eastern'): string {
  const numStr = String(value);
  if (isNaN(Number(value))) return numStr;

  const eastern = toEasternArabic(value);
  if (system === 'western') return numStr;
  if (system === 'both') return `${eastern} (${numStr})`;
  return eastern;
}

/**
 * Converts numbers from 0 to 50 into friendly Arabic spoken words for children
 */
export function toArabicWords(num: number): string {
  const words: Record<number, string> = {
    0: 'صِفْر',
    1: 'واحد',
    2: 'اثنان',
    3: 'ثلاثة',
    4: 'أربعة',
    5: 'خمسة',
    6: 'ستة',
    7: 'سبعة',
    8: 'ثمانية',
    9: 'تسعة',
    10: 'عشرة',
    11: 'أحد عشر',
    12: 'اثنا عشر',
    13: 'ثلاثة عشر',
    14: 'أربعة عشر',
    15: 'خمسة عشر',
    16: 'ستة عشر',
    17: 'سبعة عشر',
    18: 'ثمانية عشر',
    19: 'تسعة عشر',
    20: 'عشرون',
  };

  if (words[num]) return words[num];
  if (num > 20 && num < 30) {
    const unit = num - 20;
    return `${words[unit]} وعشرون`;
  }
  return String(num);
}

/**
 * List of visual aids/manipulatives requested by the user:
 * Stars, Pencils, Balls, Fruits (Apples & Oranges), Candies
 */
export const MANIPULATIVE_ITEMS: MathItemDefinition[] = [
  {
    id: 'stars',
    name: 'نجمة',
    pluralName: 'نجوم',
    icon: 'star',
    emoji: '⭐',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 border-amber-300',
  },
  {
    id: 'pencils',
    name: 'قلم رصاص',
    pluralName: 'أقلام رصاص',
    icon: 'pencil',
    emoji: '✏️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 border-blue-300',
  },
  {
    id: 'balls',
    name: 'كرة',
    pluralName: 'كرات',
    icon: 'circle-dot',
    emoji: '⚽',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 border-emerald-300',
  },
  {
    id: 'apples',
    name: 'تفاحة',
    pluralName: 'تفاحات',
    icon: 'apple',
    emoji: '🍎',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 border-rose-300',
  },
  {
    id: 'oranges',
    name: 'برتقالة',
    pluralName: 'برتقالات',
    icon: 'citrus',
    emoji: '🍊',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 border-orange-300',
  },
  {
    id: 'candies',
    name: 'حلوى',
    pluralName: 'قطع حلوى',
    icon: 'candy',
    emoji: '🍬',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 border-purple-300',
  },
];

export function getItemTheme(id: ItemTheme): MathItemDefinition {
  return MANIPULATIVE_ITEMS.find((item) => item.id === id) || MANIPULATIVE_ITEMS[0];
}

export interface OperationMeta {
  id: OperationKind;
  title: string;
  symbol: string;
  altSymbol?: string;
  badge: string;
  color: string;
  gradient: string;
  description: string;
}

export const OPERATIONS_META: Record<OperationKind, OperationMeta> = {
  addition: {
    id: 'addition',
    title: 'الجمع',
    symbol: '+',
    badge: 'إضافة وضم',
    color: 'bg-blue-500 text-white',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'نضم مجموعتين معاً لنحصل على الكل',
  },
  subtraction: {
    id: 'subtraction',
    title: 'الطرح',
    symbol: '-',
    badge: 'أخذ وإنقاص',
    color: 'bg-rose-500 text-white',
    gradient: 'from-rose-500 to-pink-500',
    description: 'نأخذ جزءاً من المجموعة لنعرف كم تبقّى',
  },
  multiplication: {
    id: 'multiplication',
    title: 'الضرب',
    symbol: '×',
    badge: 'تكرار المجموعات',
    color: 'bg-amber-500 text-white',
    gradient: 'from-amber-500 to-yellow-500',
    description: 'جمع متكرر لمجموعات متساوية',
  },
  division: {
    id: 'division',
    title: 'القسمة',
    symbol: '÷',
    badge: 'التوزيع العادل',
    color: 'bg-teal-500 text-white',
    gradient: 'from-teal-500 to-emerald-500',
    description: 'توزيع العناصر بالتساوي على مجموعات',
  },
  comparison: {
    id: 'comparison',
    title: 'المقارنة',
    symbol: '⚖️',
    altSymbol: '>  =  <',
    badge: 'أكبر وأصغر ويساوي',
    color: 'bg-purple-500 text-white',
    gradient: 'from-purple-500 to-indigo-500',
    description: 'معرفة أي الكفتين أكثر أو إذا كانتا متساويتين',
  },
};
