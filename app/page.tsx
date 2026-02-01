'use client';

import { useEffect } from 'react';
import TypingEngine from '@/components/TypingEngine';
import MetricsDisplay from '@/components/MetricsDisplay';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResetButton from '@/components/ResetButton';
import { useTypingStore } from '@/lib/store/typing-store';
import { texts } from '@/data/texts';

export default function Home() {
  const { setTargetText } = useTypingStore();

  // Initialize with default text
  useEffect(() => {
    const defaultText = texts.find(t => t.language === 'en');
    if (defaultText) {
      setTargetText(defaultText.content);
    }
  }, [setTargetText]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Digital Scribe
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Improve your authoring skills through transcription
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ResetButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Zen Focus Mode */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Metrics */}
          <MetricsDisplay />

          {/* Typing Area */}
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <TypingEngine />
          </div>
        </div>
      </main>
    </div>
  );
}
