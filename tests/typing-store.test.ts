import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTypingStore } from '@/lib/store/typing-store';
import { useHistoryStore } from '@/lib/store/history-store';

const store = () => useTypingStore.getState();

describe('typing store', () => {
  beforeEach(() => {
    vi.useRealTimers();
    store().setTargetText('가나다');
  });

  it('starts the clock on first input and stops it on completion', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    store().setUserInput('가');
    expect(store().startTime).toBe(1_000);
    expect(store().endTime).toBeNull();

    vi.setSystemTime(5_000);
    store().setUserInput('가나다');
    expect(store().endTime).toBe(5_000);
    expect(store().accuracy).toBe(100);

    // Input after completion is ignored.
    store().setUserInput('가나');
    expect(store().userInput).toBe('가나다');
  });

  it('resets progress when a new passage is chosen', () => {
    store().setUserInput('가나');
    store().setTargetText('Hello there');
    expect(store().userInput).toBe('');
    expect(store().startTime).toBeNull();
    expect(store().speedUnit).toBe('wpm');
  });

  it('does not count an in-progress IME syllable as an error', () => {
    store().setUserInput('가ㄴ', true);
    expect(store().incorrectChars).toBe(0);
    expect(store().accuracy).toBe(100);
    store().setUserInput('가ㄴ', false);
    expect(store().incorrectChars).toBe(1);
  });

  it('never stores input longer than the target', () => {
    store().setUserInput('가나다라마');
    expect(store().userInput).toBe('가나다');
  });
});

describe('typing store session tracking', () => {
  beforeEach(() => {
    vi.useRealTimers();
    useHistoryStore.setState({ sessions: [], loaded: true });
  });

  it('remembers corrected mistakes and records a finished session', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    store().setTargetText('abcde');
    store().setUserInput('a');
    store().setUserInput('ax');
    store().setUserInput('a');
    store().setUserInput('abcd');
    expect(store().incorrectChars).toBe(0);
    expect(store().mistakes).toEqual({ 1: 1 });

    vi.setSystemTime(12_000);
    store().setUserInput('abcde');
    const result = store().lastSession;
    expect(result).not.toBeNull();
    expect(result).toMatchObject({ language: 'en', unit: 'wpm', speed: 5, accuracy: 100, firstTryAccuracy: 80, mistakes: 1, chars: 5, durationMs: 12_000 });
    expect(useHistoryStore.getState().sessions).toHaveLength(1);

    store().reset();
    expect(store().lastSession).toBeNull();
    expect(store().mistakes).toEqual({});
  });

  it('files Japanese passages under ja with CPM', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    store().setTargetText('雨の駅');
    store().setUserInput('雨');
    vi.setSystemTime(6_000);
    store().setUserInput('雨の駅');
    expect(store().lastSession).toMatchObject({ language: 'ja', unit: 'cpm', speed: 30 });
  });
});
