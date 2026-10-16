import { describe, expect, it } from 'vitest';
import {
  languageOf,
  clampToTarget,
  compareChars,
  computeAccuracy,
  computeMetrics,
  computeSpeed,
  formatElapsed,
  isCjkText,
  isComplete,
  speedUnitFor,
  toChars,
} from '@/lib/metrics';

describe('toChars', () => {
  it('counts Hangul syllables, kana and kanji as one character each', () => {
    expect(toChars('한국어')).toHaveLength(3);
    expect(toChars('ひらがな漢字')).toHaveLength(6);
  });

  it('normalizes decomposed Hangul (NFD) to precomposed syllables', () => {
    const nfd = '한글'.normalize('NFD');
    expect(nfd.length).toBe(6);
    expect(toChars(nfd)).toEqual(['한', '글']);
  });

  it('keeps astral code points (emoji, CJK extension B) whole', () => {
    expect(toChars('a😀b')).toEqual(['a', '😀', 'b']);
    expect(toChars('𠮷野家')).toHaveLength(3);
  });
});

describe('script detection', () => {
  it('detects CJK text and ignores punctuation and spaces', () => {
    expect(isCjkText('좋은 아침입니다. 오늘도 화이팅!')).toBe(true);
    expect(isCjkText('おはようございます。')).toBe(true);
    expect(isCjkText('The quick brown fox.')).toBe(false);
    expect(isCjkText('...  ')).toBe(false);
  });

  it('picks CPM for CJK and WPM for Latin passages', () => {
    expect(speedUnitFor('雨の駅')).toBe('cpm');
    expect(speedUnitFor('Rain at the station')).toBe('wpm');
  });
});

describe('compareChars', () => {
  it('scores correct and incorrect characters by position', () => {
    expect(compareChars('helxo', 'hello')).toEqual({ correct: 4, incorrect: 1, pending: 0, total: 5 });
  });

  it('treats the composing last character as pending, not wrong', () => {
    // Typing 한 with an IME passes through ㅎ then 하 before committing.
    expect(compareChars('대하', '대한', true)).toEqual({ correct: 1, incorrect: 0, pending: 1, total: 2 });
    expect(compareChars('대하', '대한', false)).toEqual({ correct: 1, incorrect: 1, pending: 0, total: 2 });
  });

  it('compares NFD input against NFC target correctly', () => {
    expect(compareChars('한글'.normalize('NFD'), '한글').correct).toBe(2);
  });
});

describe('accuracy', () => {
  it('is 100 with nothing judged yet', () => {
    expect(computeAccuracy(0, 0)).toBe(100);
  });

  it('rounds to a whole percent and excludes pending characters', () => {
    expect(computeAccuracy(2, 1)).toBe(67);
    expect(computeMetrics('ab', 'ac', true).accuracy).toBe(100);
    expect(computeMetrics('ab', 'ac', false).accuracy).toBe(50);
  });
});

describe('computeSpeed', () => {
  it('uses 5 characters per word for WPM', () => {
    // 250 correct chars in one minute = 50 words.
    expect(computeSpeed(250, 60_000, 'wpm')).toBe(50);
  });

  it('reports characters per minute for CJK', () => {
    expect(computeSpeed(120, 30_000, 'cpm')).toBe(240);
  });

  it('returns 0 during the first second to avoid spikes', () => {
    expect(computeSpeed(3, 200, 'wpm')).toBe(0);
    expect(computeSpeed(0, 60_000, 'wpm')).toBe(0);
  });
});

describe('clampToTarget', () => {
  it('trims input past the end of the target by code point', () => {
    expect(clampToTarget('abcd', 'abc')).toBe('abc');
    expect(clampToTarget('😀😀😀', '😀😀')).toBe('😀😀');
    expect(clampToTarget('ab', 'abc')).toBe('ab');
  });
});

describe('isComplete', () => {
  it('requires the full length', () => {
    expect(isComplete('ab', 'abc')).toBe(false);
    expect(isComplete('abx', 'abc')).toBe(true);
    expect(isComplete('', '')).toBe(false);
  });

  it('waits for a composing final syllable unless it already matches', () => {
    expect(isComplete('대하', '대한', true)).toBe(false);
    expect(isComplete('대한', '대한', true)).toBe(true);
  });
});

describe('formatElapsed', () => {
  it('formats m:ss and never goes negative', () => {
    expect(formatElapsed(65_000)).toBe('1:05');
    expect(formatElapsed(-500)).toBe('0:00');
  });
});

describe('languageOf', () => {
  it('detects Korean, Japanese, and Latin passages', () => {
    expect(languageOf('첫눈 오는 저녁')).toBe('ko');
    expect(languageOf('小さな駅のホーム')).toBe('ja');
    expect(languageOf('Hello, world')).toBe('en');
    expect(languageOf('')).toBe('en');
  });
});
