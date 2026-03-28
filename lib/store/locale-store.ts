import { create } from 'zustand';
import { defaultLocale, type Locale } from '@/lib/i18n/config';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: defaultLocale,
  setLocale: (locale) => set({ locale }),
}));
