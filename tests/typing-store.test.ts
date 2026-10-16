import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTypingStore } from '@/lib/store/typing-store';

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
