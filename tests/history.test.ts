import { describe, expect, it } from 'vitest';
import {
  appendSession,
  HISTORY_KEY,
  loadHistory,
  MAX_SESSIONS,
  saveHistory,
  sessionsFor,
  summarize,
  type SessionRecord,
  type StorageLike,
} from '@/lib/history';

const memoryStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const session = (speed: number, overrides: Partial<SessionRecord> = {}): SessionRecord => ({
  id: `s${speed}-${Math.random()}`,
  finishedAt: speed,
  language: 'en',
  unit: 'wpm',
  speed,
  accuracy: 95,
  firstTryAccuracy: 90,
  mistakes: 2,
  chars: 100,
  durationMs: 60_000,
  preview: 'text',
  ...overrides,
});

describe('history storage', () => {
  it('round trips through storage', () => {
    const storage = memoryStorage();
    const sessions = [session(40), session(42)];
    expect(saveHistory(storage, sessions)).toBe(true);
    expect(loadHistory(storage)).toEqual(sessions);
  });

  it('survives missing, corrupt, or throwing storage', () => {
    expect(loadHistory(null)).toEqual([]);
    const storage = memoryStorage();
    storage.setItem(HISTORY_KEY, '{not json');
    expect(loadHistory(storage)).toEqual([]);
    const throwing: StorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => undefined,
    };
    expect(loadHistory(throwing)).toEqual([]);
    expect(saveHistory(throwing, [session(1)])).toBe(false);
  });

  it('drops malformed records', () => {
    const storage = memoryStorage();
    storage.setItem(HISTORY_KEY, JSON.stringify([session(30), { id: 1 }, null, session(31, { language: 'xx' as 'en' })]));
    expect(loadHistory(storage).map((s) => s.speed)).toEqual([30]);
  });

  it('caps the number of stored sessions', () => {
    let sessions: SessionRecord[] = [];
    for (let i = 0; i < MAX_SESSIONS + 5; i++) sessions = appendSession(sessions, session(i));
    expect(sessions).toHaveLength(MAX_SESSIONS);
    expect(sessions[0].speed).toBe(5);
  });
});

describe('history summaries', () => {
  it('filters by language in chronological order', () => {
    const all = [session(50, { finishedAt: 3 }), session(300, { language: 'ko', unit: 'cpm' }), session(40, { finishedAt: 1 })];
    expect(sessionsFor(all, 'en').map((s) => s.speed)).toEqual([40, 50]);
    expect(sessionsFor(all, 'ja')).toEqual([]);
  });

  it('reports best, recent mean, and trend', () => {
    const sessions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => session(v));
    const summary = summarize(sessions);
    expect(summary.count).toBe(10);
    expect(summary.bestSpeed).toBe(100);
    expect(summary.recentSpeed).toBe(80);
    expect(summary.speedTrend).toBe(50);
  });

  it('has no trend until there is an earlier window', () => {
    expect(summarize([session(10), session(20)]).speedTrend).toBeNull();
    expect(summarize([]).recentSpeed).toBe(0);
  });
});
