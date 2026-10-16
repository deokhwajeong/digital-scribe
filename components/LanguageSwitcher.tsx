'use client';

import { useTypingStore } from '@/lib/store/typing-store';
import { textsFor } from '@/data/texts';
import { localeNames, locales, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/use-i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const { setTargetText } = useTypingStore();

  const handleLanguageChange = (lang: Locale) => {
    setLocale(lang);
    // Load the first passage for the selected language (also resets progress).
    const [text] = textsFor(lang);
    if (text) {
      setTargetText(text.content);
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2" role="group" aria-label="Language">
      {locales.map((lang) => (
        <button
          key={lang}
          lang={lang}
          onClick={() => handleLanguageChange(lang)}
          aria-pressed={locale === lang}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
            locale === lang ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {localeNames[lang]}
        </button>
      ))}
    </div>
  );
}
