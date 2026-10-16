/**
 * Session history: one record per finished passage, kept in localStorage so
 * progress survives reloads. Storage is injected so the logic is unit tested
 * without a browser, and every access is guarded because storage can be
 * missing or throw (private windows, blocked site data).
 */
import type { SpeedUnit } from '@/lib/metrics';
import type { Locale } from '@/lib/i18n/config';

export interface SessionRecord {
  id: string;
  /** Epoch milliseconds when the passage was finished. */
  finishedAt: number;
  language: Locale;
  unit: SpeedUnit;
  speed: number;
  accuracy: number;
  firstTryAccuracy: number;
  mistakes: number;
  chars: number;
  durationMs: number;
  /** First characters of the passage, for the session list. */
  preview: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const HISTORY_KEY = 'digital-scribe:history:v1';
export const MAX_SESSIONS = 200;

const isRecord = (value: unknown): value is SessionRecord => {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.finishedAt === 'number' &&
    (r.language === 'en' || r.language === 'ko' || r.language === 'ja') &&
    (r.unit === 'wpm' || r.unit === 'cpm') &&
    typeof r.speed === 'number' &&
    typeof r.accuracy === 'number'
  );
};

/** Read history, dropping anything malformed instead of crashing the page. */
export const loadHistory = (storage: StorageLike | null | undefined): SessionRecord[] => {
  if (!storage) return [];
  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (storage: StorageLike | null | undefined, sessions: SessionRecord[]): boolean => {
  if (!storage) return false;
  try {
    storage.setItem(HISTORY_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
};

/** Append a session, keeping only the newest MAX_SESSIONS. */
export const appendSession = (sessions: SessionRecord[], session: SessionRecord): SessionRecord[] =>
  [...sessions, session].slice(-MAX_SESSIONS);

export const sessionsFor = (sessions: SessionRecord[], language: Locale): SessionRecord[] =>
  sessions.filter((s) => s.language === language).sort((a, b) => a.finishedAt - b.finishedAt);

export interface HistorySummary {
  count: number;
  bestSpeed: number;
  /** Mean speed of the last `window` sessions. */
  recentSpeed: number;
  recentAccuracy: number;
  /** Recent mean minus the mean of the window before it; null without enough data. */
  speedTrend: number | null;
}

const mean = (values: number[]): number =>
  values.length === 0 ? 0 : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

export const summarize = (sessions: SessionRecord[], window = 5): HistorySummary => {
  const recent = sessions.slice(-window);
  const before = sessions.slice(-window * 2, -window);
  return {
    count: sessions.length,
    bestSpeed: sessions.reduce((best, s) => Math.max(best, s.speed), 0),
    recentSpeed: mean(recent.map((s) => s.speed)),
    recentAccuracy: mean(recent.map((s) => s.accuracy)),
    speedTrend: before.length > 0 ? mean(recent.map((s) => s.speed)) - mean(before.map((s) => s.speed)) : null,
  };
};

/** Browser localStorage, or null when it is unavailable. */
export const browserStorage = (): StorageLike | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
};
