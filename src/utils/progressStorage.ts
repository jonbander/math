import type { AchievementBadge } from '../types/math';

export interface CompletedTask {
  id: string;
  title: string;
  completedAt: string;
}

export interface AppProgress {
  badges: AchievementBadge[];
  completedTasks: CompletedTask[];
}

export interface ProgressStorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export const PROGRESS_STORAGE_KEY = 'math_heroes_progress_v1';
const PROGRESS_SCHEMA_VERSION = 1;
const MAX_SAVED_TASKS = 500;

const browserStorage = (): ProgressStorageAdapter | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

const copyBadges = (badges: AchievementBadge[]): AchievementBadge[] =>
  badges.map((badge) => ({ ...badge }));

export const createEmptyProgress = (defaultBadges: AchievementBadge[]): AppProgress => ({
  badges: copyBadges(defaultBadges),
  completedTasks: [],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function loadProgress(
  defaultBadges: AchievementBadge[],
  storage: ProgressStorageAdapter | null = browserStorage(),
): AppProgress {
  const empty = createEmptyProgress(defaultBadges);
  if (!storage) return empty;

  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== PROGRESS_SCHEMA_VERSION) return empty;

    const storedBadges = new Map<string, Record<string, unknown>>();
    if (Array.isArray(parsed.badges)) {
      for (const value of parsed.badges) {
        if (isRecord(value) && typeof value.id === 'string') storedBadges.set(value.id, value);
      }
    }

    const badges = defaultBadges.map((defaultBadge) => {
      const stored = storedBadges.get(defaultBadge.id);
      if (!stored) return { ...defaultBadge };
      const currentCount = typeof stored.currentCount === 'number' && Number.isFinite(stored.currentCount)
        ? Math.max(0, stored.currentCount)
        : defaultBadge.currentCount;
      const unlockedAt = typeof stored.unlockedAt === 'string' ? stored.unlockedAt : defaultBadge.unlockedAt;
      return {
        ...defaultBadge,
        unlocked: defaultBadge.unlocked || stored.unlocked === true,
        currentCount,
        ...(unlockedAt ? { unlockedAt } : {}),
      };
    });

    const completedTasks = Array.isArray(parsed.completedTasks)
      ? parsed.completedTasks
          .filter((task): task is Record<string, unknown> =>
            isRecord(task) &&
            typeof task.id === 'string' && task.id.length > 0 && task.id.length <= 160 &&
            typeof task.title === 'string' && task.title.length > 0 && task.title.length <= 200 &&
            typeof task.completedAt === 'string' && !Number.isNaN(Date.parse(task.completedAt)),
          )
          .map((task) => ({
            id: task.id as string,
            title: task.title as string,
            completedAt: task.completedAt as string,
          }))
          .slice(0, MAX_SAVED_TASKS)
      : [];

    return { badges, completedTasks };
  } catch {
    return empty;
  }
}

export function saveProgress(
  progress: AppProgress,
  storage: ProgressStorageAdapter | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      version: PROGRESS_SCHEMA_VERSION,
      badges: progress.badges.map(({ id, unlocked, currentCount, unlockedAt }) => ({
        id, unlocked, currentCount, unlockedAt,
      })),
      completedTasks: progress.completedTasks.slice(0, MAX_SAVED_TASKS),
    }));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedProgress(
  storage: ProgressStorageAdapter | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(PROGRESS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function addCompletedTask(
  currentTasks: CompletedTask[],
  id: string,
  title: string,
  completedAt = new Date().toISOString(),
): CompletedTask[] {
  if (!id.trim() || currentTasks.some((task) => task.id === id)) return currentTasks;
  return [{ id, title, completedAt }, ...currentTasks].slice(0, MAX_SAVED_TASKS);
}
