/**
 * Pure typing metrics. No React, no store: easy to unit test.
 *
 * All comparisons work on Unicode code points of NFC-normalized text, so
 * precomposed Hangul syllables, kana, kanji and astral characters (emoji,
 * rare CJK extension ideographs) each count as exactly one character.
 */

export type SpeedUnit = 'wpm' | 'cpm';

export interface CharComparison {
  correct: number;
  incorrect: number;
  /** Characters still being composed by an IME; neither right nor wrong yet. */
  pending: number;
  total: number;
}

export interface TypingMetrics extends CharComparison {
  accuracy: number;
}

/** Characters per "word" in the standard WPM formula. */
export const CHARS_PER_WORD = 5;

/** Below this elapsed time speed is reported as 0 to avoid absurd spikes. */
export const MIN_ELAPSED_MS = 1000;

const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

export const normalize = (text: string): string => text.normalize('NFC');

/** Split a string into user-perceived code points (NFC). */
export const toChars = (text: string): string[] => Array.from(normalize(text));

export const isCjkChar = (char: string): boolean => CJK_RE.test(char);

/**
 * True when most visible characters are Chinese, Japanese or Korean script.
 * Whitespace and punctuation are ignored so a Korean sentence with spaces
 * and periods is still detected as CJK.
 */
export const isCjkText = (text: string): boolean => {
  let cjk = 0;
  let letters = 0;
  for (const char of toChars(text)) {
    if (/[\p{L}\p{N}]/u.test(char)) {
      letters++;
      if (isCjkChar(char)) cjk++;
    }
  }
  return letters > 0 && cjk / letters >= 0.5;
};

/**
 * Words are not space-delimited in Japanese, and a Korean "word" (eojeol) is
 * far longer than 5 keystrokes, so CJK passages are measured in characters
 * per minute instead of WPM.
 */
export const speedUnitFor = (target: string): SpeedUnit => (isCjkText(target) ? 'cpm' : 'wpm');

/** Trim input so it never runs past the end of the target. */
export const clampToTarget = (input: string, target: string): string => {
  const targetLength = toChars(target).length;
  const chars = toChars(input);
  return chars.length > targetLength ? chars.slice(0, targetLength).join('') : normalize(input);
};

export const compareChars = (input: string, target: string, composing = false): CharComparison => {
  const typed = toChars(input);
  const expected = toChars(target);
  let correct = 0;
  let incorrect = 0;
  let pending = 0;

  typed.forEach((char, i) => {
    const isLast = i === typed.length - 1;
    if (char === expected[i]) {
      correct++;
    } else if (composing && isLast) {
      pending++;
    } else {
      incorrect++;
    }
  });

  return { correct, incorrect, pending, total: typed.length };
};

export const computeAccuracy = (correct: number, incorrect: number): number => {
  const judged = correct + incorrect;
  return judged === 0 ? 100 : Math.round((correct / judged) * 100);
};

export const computeMetrics = (input: string, target: string, composing = false): TypingMetrics => {
  const comparison = compareChars(input, target, composing);
  return { ...comparison, accuracy: computeAccuracy(comparison.correct, comparison.incorrect) };
};

/**
 * Net speed from correctly typed characters.
 * wpm: (correct / 5) per minute. cpm: correct characters per minute.
 */
export const computeSpeed = (correctChars: number, elapsedMs: number, unit: SpeedUnit): number => {
  if (elapsedMs < MIN_ELAPSED_MS || correctChars <= 0) return 0;
  const minutes = elapsedMs / 60000;
  const units = unit === 'wpm' ? correctChars / CHARS_PER_WORD : correctChars;
  return Math.round(units / minutes);
};

/**
 * A passage is complete when every character has been entered. While an IME
 * is still composing the final character we only accept it if it already
 * matches, so a half-built Hangul syllable does not end the run early.
 */
export const isComplete = (input: string, target: string, composing = false): boolean => {
  const typed = toChars(input);
  const expected = toChars(target);
  if (expected.length === 0 || typed.length !== expected.length) return false;
  if (!composing) return true;
  return typed[typed.length - 1] === expected[expected.length - 1];
};

export const formatElapsed = (elapsedMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Best-guess passage language, used to file finished sessions. Hangul means
 * Korean; kana or kanji means Japanese; anything else is filed as English.
 */
export const languageOf = (text: string): 'en' | 'ko' | 'ja' => {
  let hangul = 0;
  let japanese = 0;
  for (const char of toChars(text)) {
    if (/\p{Script=Hangul}/u.test(char)) hangul++;
    else if (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(char)) japanese++;
  }
  if (hangul === 0 && japanese === 0) return 'en';
  return hangul >= japanese ? 'ko' : 'ja';
};
