/**
 * Per-character mistake tracking. Live accuracy only looks at the current
 * input, so a typo that was corrected with Backspace disappears from it.
 * These helpers remember every committed wrong entry, keyed by the target
 * position, so a finished passage can show where the typist actually struggled.
 */
import { toChars } from '@/lib/metrics';

/** Sparse map: target index -> number of wrong entries at that index. */
export type MistakeMap = Record<number, number>;

/**
 * Indices that became wrong in this input update. A position counts once per
 * wrong entry: it is new when the previous input had nothing committed there,
 * had a different character, or was still being composed by an IME. An IME
 * character that is still composing (last position) never counts.
 */
export const newMistakeIndices = (
  prevInput: string,
  prevComposing: boolean,
  nextInput: string,
  nextComposing: boolean,
  target: string,
): number[] => {
  const prev = toChars(prevInput);
  const next = toChars(nextInput);
  const expected = toChars(target);
  const result: number[] = [];

  next.forEach((char, i) => {
    if (char === expected[i]) return;
    if (nextComposing && i === next.length - 1) return;
    const prevPending = prevComposing && i === prev.length - 1;
    const sameCommitted = prev[i] === char && !prevPending;
    if (!sameCommitted) result.push(i);
  });
  return result;
};

export const addMistakes = (map: MistakeMap, indices: number[]): MistakeMap => {
  if (indices.length === 0) return map;
  const next = { ...map };
  for (const i of indices) next[i] = (next[i] ?? 0) + 1;
  return next;
};

export const totalMistakes = (map: MistakeMap): number =>
  Object.values(map).reduce((sum, count) => sum + count, 0);

/**
 * Share of target characters typed right on the first attempt (0 to 100).
 * Whitespace is included: a missed space is a real error.
 */
export const firstTryAccuracy = (map: MistakeMap, targetLength: number): number => {
  if (targetLength <= 0) return 100;
  const missed = Object.keys(map).filter((key) => Number(key) < targetLength).length;
  // Floor, so a single slip in a long passage never reads as 100%.
  return Math.floor(((targetLength - missed) / targetLength) * 100);
};

/** Heat level for one position: 0 none, 1 once, 2 twice, 3 three or more. */
export const heatLevel = (count: number | undefined): 0 | 1 | 2 | 3 => {
  if (!count || count <= 0) return 0;
  return count >= 3 ? 3 : (count as 1 | 2);
};

export interface MissedChar {
  char: string;
  count: number;
}

/**
 * Characters that were mistyped most, aggregated across all their positions.
 * Whitespace is skipped (it is shown in the heatmap instead). Ties keep the
 * order of first appearance in the passage.
 */
export const topMissedChars = (map: MistakeMap, target: string, limit = 5): MissedChar[] => {
  const chars = toChars(target);
  const totals = new Map<string, number>();
  Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((i) => {
      const char = chars[i];
      if (char === undefined || /\s/u.test(char)) return;
      totals.set(char, (totals.get(char) ?? 0) + map[i]);
    });
  return [...totals.entries()]
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
