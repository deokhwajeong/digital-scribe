import { create } from 'zustand';
import { texts } from '@/data/texts';
import { defaultLocale } from '@/lib/i18n/config';
import {
  clampToTarget,
  computeMetrics,
  isComplete,
  normalize,
  speedUnitFor,
  type SpeedUnit,
} from '@/lib/metrics';

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
};

export const useTypingStore = create<TypingState>((set, get) => ({
  ...emptyProgress,
  targetText: normalize(initialText),
  speedUnit: speedUnitFor(initialText),

  setUserInput: (rawInput, composing = false) => {
    const { targetText, startTime, endTime } = get();
    if (!targetText || endTime) return;

    const userInput = clampToTarget(rawInput, targetText);
    const metrics = computeMetrics(userInput, targetText, composing);
    const now = Date.now();
    const started = startTime ?? (userInput.length > 0 ? now : null);

    set({
      userInput,
      composing,
      startTime: started,
      endTime: isComplete(userInput, targetText, composing) ? now : null,
      accuracy: metrics.accuracy,
      correctChars: metrics.correct,
      incorrectChars: metrics.incorrect,
      totalChars: metrics.total,
    });
  },

  // Choosing a new passage always starts a fresh run; otherwise the old
  // input would be scored against the new text.
  setTargetText: (text) => {
    const targetText = normalize(text);
    set({ ...emptyProgress, targetText, speedUnit: speedUnitFor(targetText) });
  },

  reset: () => set({ ...emptyProgress }),
}));
