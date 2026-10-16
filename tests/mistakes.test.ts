import { describe, expect, it } from 'vitest';
import {
  addMistakes,
  firstTryAccuracy,
  heatLevel,
  newMistakeIndices,
  topMissedChars,
  totalMistakes,
} from '@/lib/mistakes';

describe('newMistakeIndices', () => {
  it('flags a newly typed wrong character once', () => {
    expect(newMistakeIndices('', false, 'hx', false, 'hello')).toEqual([1]);
    // Typing on after the typo does not count the same typo again.
    expect(newMistakeIndices('hx', false, 'hxl', false, 'hello')).toEqual([]);
  });

  it('counts a second wrong attempt after a correction', () => {
    expect(newMistakeIndices('h', false, 'hx', false, 'hello')).toEqual([1]);
    expect(newMistakeIndices('hx', false, 'h', false, 'hello')).toEqual([]);
    expect(newMistakeIndices('h', false, 'hz', false, 'hello')).toEqual([1]);
  });

  it('ignores an IME syllable that is still composing', () => {
    expect(newMistakeIndices('가', false, '가ㄴ', true, '가나다')).toEqual([]);
    expect(newMistakeIndices('가ㄴ', true, '가나', true, '가나다')).toEqual([]);
  });

  it('counts a composed character that commits wrong', () => {
    expect(newMistakeIndices('가ㄴ', true, '가난', false, '가나다')).toEqual([1]);
    // Committing the same pending character as-is is also a mistake.
    expect(newMistakeIndices('가ㄴ', true, '가ㄴ', false, '가나다')).toEqual([1]);
  });

  it('works on NFD input by normalizing first', () => {
    const nfd = '가'.normalize('NFD');
    expect(newMistakeIndices('', false, nfd, false, '가')).toEqual([]);
  });
});

describe('mistake summaries', () => {
  const map = addMistakes(addMistakes({}, [1, 3]), [1]);

  it('accumulates counts per index', () => {
    expect(map).toEqual({ 1: 2, 3: 1 });
    expect(totalMistakes(map)).toBe(3);
    expect(addMistakes(map, [])).toBe(map);
  });

  it('computes first try accuracy from distinct positions', () => {
    expect(firstTryAccuracy(map, 10)).toBe(80);
    expect(firstTryAccuracy({}, 0)).toBe(100);
  });

  it('buckets heat levels', () => {
    expect([undefined, 0, 1, 2, 3, 9].map(heatLevel)).toEqual([0, 0, 1, 2, 3, 3]);
  });

  it('ranks the most missed characters and skips whitespace', () => {
    // "a cat": a at 0 and 3, space at 1
    const m = { 0: 1, 1: 4, 3: 2, 4: 1 };
    expect(topMissedChars(m, 'a cat')).toEqual([
      { char: 'a', count: 3 },
      { char: 't', count: 1 },
    ]);
    expect(topMissedChars(m, 'a cat', 1)).toHaveLength(1);
  });
});

describe('firstTryAccuracy rounding', () => {
  it('never shows 100% when there was a mistake', () => {
    expect(firstTryAccuracy({ 5: 1 }, 286)).toBe(99);
  });
});
