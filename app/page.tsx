'use client';

import { useEffect, useState } from 'react';
import TypingEngine from '@/components/TypingEngine';
import MetricsDisplay from '@/components/MetricsDisplay';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ResetButton from '@/components/ResetButton';
import FileUploader from '@/components/FileUploader';
import OCRUploader from '@/components/OCRUploader';
import KidsTypingGame from '@/components/KidsTypingGame';
import { useTypingStore } from '@/lib/store/typing-store';
import { texts } from '@/data/texts';
import { BookOpen, Upload, Camera, ChevronDown, ChevronUp, Gamepad2, PencilLine } from 'lucide-react';

type InputMode = 'preset' | 'file' | 'ocr';
type AppMode = 'classic' | 'kids';

export default function Home() {
  const { setTargetText, targetText, reset } = useTypingStore();
  const [appMode, setAppMode] = useState<AppMode>('classic');
  const [inputMode, setInputMode] = useState<InputMode>('preset');
  const [showInputOptions, setShowInputOptions] = useState(true);

  // Initialize with default text
  useEffect(() => {
    const defaultText = texts.find(t => t.language === 'en');
    if (defaultText) {
      setTargetText(defaultText.content);
    }
  }, [setTargetText]);

  // Auto-collapse input options when typing starts
  useEffect(() => {
    if (targetText) {
      // Keep open for a bit, then allow collapse
    }
  }, [targetText]);

  const switchAppMode = (mode: AppMode) => {
    setAppMode(mode);
    if (mode === 'kids') {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Digital Scribe
                </h1>
                <p className="text-xs text-gray-500">
                  타이핑으로 작문 실력을 향상시키세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ResetButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => switchAppMode('classic')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  appMode === 'classic'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <PencilLine className="h-4 w-4" />
                <span>일반 모드</span>
              </button>
              <button
                onClick={() => switchAppMode('kids')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  appMode === 'kids'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>아이들 게임</span>
              </button>
            </div>
          </div>

          {appMode === 'kids' ? (
            <KidsTypingGame />
          ) : (
            <>
          {/* Metrics */}
          <MetricsDisplay />

          {/* Input Options - Collapsible */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowInputOptions(!showInputOptions)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">📝 텍스트 소스 선택</span>
              {showInputOptions ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {showInputOptions && (
              <div className="px-6 pb-6 space-y-4">
                {/* Mode Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setInputMode('preset')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                      inputMode === 'preset'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>샘플 텍스트</span>
                  </button>
                  <button
                    onClick={() => setInputMode('file')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                      inputMode === 'file'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>파일 업로드</span>
                  </button>
                  <button
                    onClick={() => setInputMode('ocr')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                      inputMode === 'ocr'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Camera className="h-4 w-4" />
                    <span>OCR</span>
                  </button>
                </div>

                {/* Mode Content */}
                <div className="pt-2">
                  {inputMode === 'preset' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {texts.map((text) => (
                        <button
                          key={text.id}
                          onClick={() => setTargetText(text.content)}
                          className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                            targetText === text.content
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{text.title}</h3>
                              <p className="text-sm text-gray-500">{text.author}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              text.language === 'en' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {text.language === 'en' ? 'EN' : 'KO'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {text.content.substring(0, 100)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {inputMode === 'file' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        .txt, .md, .xlsx, .csv 파일을 업로드하여 타이핑 연습을 할 수 있습니다.
                      </p>
                      <FileUploader />
                    </div>
                  )}

                  {inputMode === 'ocr' && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">
                        책 페이지나 문서 사진을 업로드하면 텍스트를 자동으로 인식합니다.
                      </p>
                      <OCRUploader />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Typing Area */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <TypingEngine />
          </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            Digital Scribe — 꾸준한 연습으로 타이핑 실력을 향상시키세요
          </p>
        </div>
      </footer>
    </div>
  );
}
