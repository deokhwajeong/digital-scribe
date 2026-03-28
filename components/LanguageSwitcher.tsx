'use client';

import { useTypingStore } from '@/lib/store/typing-store';
import { texts } from '@/data/texts';
import { localeNames, locales, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/use-i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const { setTargetText, reset } = useTypingStore();

  const handleLanguageChange = (lang: Locale) => {
    setLocale(lang);
    reset();

    // Load text for the selected language
    const text = texts.find((item) => item.language === lang) ?? texts.find((item) => item.language === 'en');
    if (text) {
      setTargetText(text.content);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            locale === lang
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {localeNames[lang]}
        </button>
      ))}
    </div>
  );
}
