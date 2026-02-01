import { create } from 'zustand';

export interface TypingState {
  // Current input from user
  userInput: string;
  
  // Target text to type
  targetText: string;
  
  // Typing statistics
  startTime: number | null;
  wpm: number;
  accuracy: number;
  
  // Character-level tracking
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  
  // Actions
  setUserInput: (input: string) => void;
  setTargetText: (text: string) => void;
  startTyping: () => void;
  reset: () => void;
  calculateMetrics: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  userInput: '',
  targetText: '',
  startTime: null,
  wpm: 0,
  accuracy: 100,
  correctChars: 0,
  incorrectChars: 0,
  totalChars: 0,

  setUserInput: (input: string) => {
    set({ userInput: input });
    get().calculateMetrics();
  },

  setTargetText: (text: string) => {
    set({ targetText: text });
  },

  startTyping: () => {
    if (!get().startTime) {
      set({ startTime: Date.now() });
    }
  },

  reset: () => {
    set({
      userInput: '',
      startTime: null,
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalChars: 0,
    });
  },

  calculateMetrics: () => {
    const { userInput, targetText, startTime } = get();
    
    if (!userInput || !targetText) {
      return;
    }

    // Calculate accuracy
    let correct = 0;
    let incorrect = 0;
    
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const total = userInput.length;
    const accuracy = total > 0 ? (correct / total) * 100 : 100;

    // Calculate WPM (Words Per Minute)
    // Assuming average word length of 5 characters
    let wpm = 0;
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      if (timeElapsed > 0) {
        const words = correct / 5; // 5 chars per word
        wpm = Math.round(words / timeElapsed);
      }
    }

    set({
      correctChars: correct,
      incorrectChars: incorrect,
      totalChars: total,
      accuracy: Math.round(accuracy),
      wpm,
    });
  },
}));
