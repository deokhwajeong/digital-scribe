import { create } from 'zustand';
import {
  appendSession,
  browserStorage,
  HISTORY_KEY,
  loadHistory,
  saveHistory,
  type SessionRecord,
  type StorageLike,
} from '@/lib/history';

interface HistoryState {
  sessions: SessionRecord[];
  /** False until history has been read from storage (after hydration). */
  loaded: boolean;
  load: (storage?: StorageLike | null) => void;
  add: (session: SessionRecord, storage?: StorageLike | null) => void;
  clear: (storage?: StorageLike | null) => void;
}

// Storage is read in an effect, not at module load, so the static export
// renders the same markup on the server and on first client paint.
export const useHistoryStore = create<HistoryState>((set, get) => ({
  sessions: [],
  loaded: false,
  load: (storage = browserStorage()) => set({ sessions: loadHistory(storage), loaded: true }),
  add: (session, storage = browserStorage()) => {
    // Merge with whatever is stored so another tab's sessions are kept.
    const base = get().loaded ? get().sessions : loadHistory(storage);
    const sessions = appendSession(base, session);
    saveHistory(storage, sessions);
    set({ sessions, loaded: true });
  },
  clear: (storage = browserStorage()) => {
    try {
      storage?.removeItem(HISTORY_KEY);
    } catch {
      // Storage blocked: clearing the in-memory list is still useful.
    }
    set({ sessions: [] });
  },
}));
