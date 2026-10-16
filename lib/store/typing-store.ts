import { create } from 'zustand';
import { texts } from '@/data/texts';
import { defaultLocale } from '@/lib/i18n/config';
import {
  clampToTarget,
  computeMetrics,
  computeSpeed,
  isComplete,
  languageOf,
  normalize,
  speedUnitFor,
  toChars,
  type SpeedUnit,
} from '@/lib/metrics';
import { addMistakes, firstTryAccuracy, newMistakeIndices, totalMistakes, type MistakeMap } from '@/lib/mistakes';
import type { SessionRecord } from '@/lib/history';
import { useHistoryStore } from '@/lib/store/history-store';

export interface TypingState {
  userInput: string;
  targetText: string;
  speedUnit: SpeedUnit;
  /** True while an IME (Korean, Japanese) is composing the last character. */
  composing: boolean;

  startTime: number | null;
  endTime: number | null;
  accuracy: number;

  correctChars: number;
  incorrectChars: number;
  totalChars: number;

  /** Every committed wrong entry by target index, including corrected ones. */
  mistakes: MistakeMap;
  /** Summary of the run that just finished; null while typing. */
  lastSession: SessionRecord | null;

  setUserInput: (input: string, composing?: boolean) => void;
  setTargetText: (text: string) => void;
  reset: () => void;
}

const initialText = texts.find((item) => item.language === defaultLocale)?.content ?? '';

const emptyProgress = {
  userInput: '',
  composing: false,
  startTime: null,
  endTime: null,
  accuracy: 100,
  correctChars: 0,
  incorrectChars: 0,
  totalChars: 0,
  mistakes: {} as MistakeMap,
  lastSession: null,
};

let sessionCounter = 0;

export const buildSession = (args: {
  targetText: string;
  speedUnit: SpeedUnit;
  startTime: number;
  endTime: number;
  correctChars: number;
  accuracy: number;
  mistakes: MistakeMap;
}): SessionRecord => {
  const chars = toChars(args.targetText);
  const durationMs = Math.max(0, args.endTime - args.startTime);
  return {
    id: `${args.endTime.toString(36)}-${(sessionCounter++).toString(36)}`,
    finishedAt: args.endTime,
    language: languageOf(args.targetText),
    unit: args.speedUnit,
    speed: computeSpeed(args.correctChars, durationMs, args.speedUnit),
    accuracy: args.accuracy,
    firstTryAccuracy: firstTryAccuracy(args.mistakes, chars.length),
    mistakes: totalMistakes(args.mistakes),
    chars: chars.length,
    durationMs,
    preview: chars.slice(0, 40).join(''),
  };
};

export const useTypingStore = create<TypingState>((set, get) => ({
  ...emptyProgress,
  targetText: normalize(initialText),
  speedUnit: speedUnitFor(initialText),

  setUserInput: (rawInput, composing = false) => {
    const state = get();
    const { targetText, startTime, endTime } = state;
    if (!targetText || endTime) return;

    const userInput = clampToTarget(rawInput, targetText);
    const metrics = computeMetrics(userInput, targetText, composing);
    const now = Date.now();
    const started = startTime ?? (userInput.length > 0 ? now : null);
    const mistakes = addMistakes(
      state.mistakes,
      newMistakeIndices(state.userInput, state.composing, userInput, composing, targetText),
    );
    const finished = isComplete(userInput, targetText, composing);

    const lastSession =
      finished && started !== null
        ? buildSession({
            targetText,
            speedUnit: state.speedUnit,
            startTime: started,
            endTime: now,
            correctChars: metrics.correct,
            accuracy: metrics.accuracy,
            mistakes,
          })
        : null;

    set({
      userInput,
      composing,
      startTime: started,
      endTime: finished ? now : null,
      accuracy: metrics.accuracy,
      correctChars: metrics.correct,
      incorrectChars: metrics.incorrect,
      totalChars: metrics.total,
      mistakes,
      lastSession,
    });

    if (lastSession) useHistoryStore.getState().add(lastSession);
  },

  // Choosing a new passage always starts a fresh run; otherwise the old
  // input would be scored against the new text.
  setTargetText: (text) => {
    const targetText = normalize(text);
    set({ ...emptyProgress, targetText, speedUnit: speedUnitFor(targetText) });
  },

  reset: () => set({ ...emptyProgress }),
}));
