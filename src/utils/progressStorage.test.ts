// @ts-expect-error Bun provides this module only while running tests; it is not an app dependency.
import { describe, expect, test } from 'bun:test';
import type { AchievementBadge } from '../types/math';
import {
  addCompletedTask,
  clearSavedProgress,
  loadProgress,
  PROGRESS_STORAGE_KEY,
  saveProgress,
  type ProgressStorageAdapter,
} from './progressStorage';

class MemoryStorage implements ProgressStorageAdapter {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const defaults: AchievementBadge[] = [
  { id: 'first_step', title: 'البداية', description: 'بدأ', emoji: '🌱', unlocked: true, targetCount: 1, currentCount: 1 },
  { id: 'number_writer', title: 'كاتب الأرقام', description: 'كتب', emoji: '✏️', unlocked: false, targetCount: 10, currentCount: 0 },
];

describe('local progress storage', () => {
  test('returns independent default progress when the device has no saved record', () => {
    const progress = loadProgress(defaults, new MemoryStorage());
    expect(progress.badges).toEqual(defaults);
    expect(progress.badges).not.toBe(defaults);
    expect(progress.completedTasks).toEqual([]);
  });

  test('restores completed tasks and earned badges after a reload', () => {
    const storage = new MemoryStorage();
    const badgeProgress = defaults.map((badge) => badge.id === 'number_writer'
      ? { ...badge, unlocked: true, currentCount: 10, unlockedAt: '2026-10-25T12:00:00.000Z' }
      : { ...badge });
    const completedTasks = [{
      id: 'write-number-1',
      title: 'كتابة الرقم ١',
      completedAt: '2026-10-25T12:00:00.000Z',
    }];

    expect(saveProgress({ badges: badgeProgress, completedTasks }, storage)).toBe(true);
    const restored = loadProgress(defaults, storage);
    expect(restored.badges.find((badge) => badge.id === 'number_writer')?.unlocked).toBe(true);
    expect(restored.badges.find((badge) => badge.id === 'number_writer')?.currentCount).toBe(10);
    expect(restored.completedTasks).toEqual(completedTasks);
  });

  test('ignores malformed JSON and returns defaults instead of crashing', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, '{broken');
    expect(loadProgress(defaults, storage)).toEqual({ badges: defaults, completedTasks: [] });
  });

  test('reset clears only progress and leaves the sound preference untouched', () => {
    const storage = new MemoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, 'progress');
    storage.setItem('arabic_math_sound_muted', 'true');
    expect(clearSavedProgress(storage)).toBe(true);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
    expect(storage.getItem('arabic_math_sound_muted')).toBe('true');
  });

  test('records each completed task once and places new work first', () => {
    const first = addCompletedTask([], 'addition:add-1', 'مسألة جمع', '2026-10-25T12:00:00.000Z');
    const duplicate = addCompletedTask(first, 'addition:add-1', 'مسألة جمع', '2026-10-25T12:01:00.000Z');
    const second = addCompletedTask(duplicate, 'scale:3:5', 'مقارنة ٣ و٥', '2026-10-25T12:02:00.000Z');
    expect(duplicate).toBe(first);
    expect(second.map((task) => task.id)).toEqual(['scale:3:5', 'addition:add-1']);
  });
});
