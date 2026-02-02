'use client';

import { useState } from 'react';
import { useTypingStore } from '@/lib/store/typing-store';
import { texts } from '@/data/texts';

type Language = 'en' | 'ko';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const { setTargetText, reset } = useTypingStore();

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    reset();
    
    // Load text for the selected language
    const text = texts.find(t => t.language === lang);
    if (text) {
      setTargetText(text.content);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          currentLang === 'en'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ko')}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          currentLang === 'ko'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        한국어
      </button>
    </div>
  );
}
