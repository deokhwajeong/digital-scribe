'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTypingStore } from '@/lib/store/typing-store';
import { Keyboard, Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/lib/i18n/use-i18n';
import { toChars } from '@/lib/metrics';

export default function TypingEngine() {
  const { t } = useI18n();
  const { userInput, targetText, composing, endTime, setUserInput } = useTypingStore();
  const targetChars = useMemo(() => toChars(targetText), [targetText]);
  const typedChars = useMemo(() => toChars(userInput), [userInput]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    // Focus on mount without jumping the page down to the typing area.
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Auto-scroll to cursor position
  useEffect(() => {
    if (cursorRef.current && containerRef.current) {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      const containerRect = container.getBoundingClientRect();
      const cursorRect = cursor.getBoundingClientRect();
      
      // Check if cursor is out of view
      if (cursorRect.bottom > containerRect.bottom - 20) {
        container.scrollTop += cursorRect.bottom - containerRect.bottom + 40;
      } else if (cursorRect.top < containerRect.top + 20) {
        container.scrollTop -= containerRect.top - cursorRect.top + 40;
      }
    }
  }, [typedChars.length]);

  // IME composition (Korean, Japanese) fires change events with partial
  // characters. They are tracked as "composing" so the last character shows
  // as pending instead of a typo until the syllable or kana is committed.
  const composingRef = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.currentTarget.value, composingRef.current);
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    composingRef.current = false;
    setUserInput(e.currentTarget.value, false);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getCharacterClassName = (index: number): string => {
    const baseClass = 'transition-colors duration-100';
    
    if (index >= typedChars.length) {
      return `${baseClass} text-gray-400`; // Not yet typed
    }

    if (typedChars[index] === targetChars[index]) {
      return `${baseClass} text-emerald-600 bg-emerald-50 rounded-sm`; // Correct
    }
    
    if (composing && index === typedChars.length - 1) {
      return `${baseClass} text-blue-600 bg-blue-50 rounded-sm underline decoration-blue-400 decoration-2`; // IME composing
    }

    return `${baseClass} text-red-500 bg-red-100 rounded-sm underline decoration-red-400 decoration-2`; // Incorrect
  };

  const isCompleted = endTime !== null;
  const progressPercent = targetChars.length > 0 ? (typedChars.length / targetChars.length) * 100 : 0;

  // Split text into lines for better display
  const renderText = () => {
    if (!targetText) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Keyboard className="h-12 w-12 mb-3 opacity-50" aria-hidden="true" />
          <p className="text-lg">{t('typing.emptyTitle')}</p>
          <p className="text-sm mt-1">{t('typing.emptyHint')}</p>
        </div>
      );
    }

    return (
      <div className="font-mono text-lg leading-[2] tracking-wide whitespace-pre-wrap break-words">
        {targetChars.map((char, index) => {
          const isCursor = index === typedChars.length;
          return (
            <span
              key={index}
              ref={isCursor ? cursorRef : null}
              className={`${getCharacterClassName(index)} ${
                isCursor && isFocused ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              }`}
            >
              {char === '\n' ? '↵\n' : char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      {targetText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('typing.progress')}</span>
            <span className="font-medium text-gray-700">
              {t('typing.chars', { typed: typedChars.length, total: targetChars.length })}
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-gray-100 overflow-hidden"
            role="progressbar"
            aria-label={t('typing.progress')}
            aria-valuemin={0}
            aria-valuemax={targetChars.length}
            aria-valuenow={typedChars.length}
          >
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Target text display with highlighting */}
      <div 
        ref={containerRef}
        onClick={focusInput}
        onPointerDown={focusInput}
        className={`typing-display relative cursor-text rounded-xl border-2 bg-white p-6 transition-all duration-200 ${
          showFullText ? 'max-h-none' : 'max-h-80'
        } overflow-y-auto scroll-smooth ${
          isFocused 
            ? 'border-blue-400 shadow-lg shadow-blue-100' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        } ${isCompleted ? 'border-emerald-400 shadow-emerald-100' : ''}`}
      >
        {renderText()}
        
        {/* Completion badge: the results card below holds the details, so the
            passage stays visible instead of being covered by an overlay. */}
        {isCompleted && (
          <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
            {t('typing.completed')}
          </div>
        )}

        {/* Transparent input layer to make keyboard input reliable across browsers/IME */}
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 z-10 h-full w-full cursor-text resize-none bg-transparent text-transparent caret-transparent outline-none"
          placeholder={t('typing.placeholder')}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          disabled={!targetText || isCompleted}
          aria-label={t('typing.ariaInput')}
          data-testid="typing-input"
        />
      </div>

      {/* Show more/less toggle for long texts */}
      {targetChars.length > 500 && (
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mx-auto"
        >
          {showFullText ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>{t('typing.showLess')}</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>{t('typing.showMore')}</span>
            </>
          )}
        </button>
      )}

      {/* Instruction text */}
      <div className="text-center text-sm" aria-live="polite">
        {!targetText ? (
          <span className="text-gray-400">{t('typing.instructionSelect')}</span>
        ) : isCompleted ? (
          <span className="text-emerald-700">{t('typing.completedHint')}</span>
        ) : typedChars.length === 0 ? (
          <span className="text-blue-500 animate-pulse">
            👆 {t('typing.instructionStart')}
          </span>
        ) : !isFocused ? (
          <span className="text-amber-500">
            ⚠️ {t('typing.instructionFocus')}
          </span>
        ) : (
          <span className="text-gray-500">
            {t('typing.instructionTyping')}
          </span>
        )}
      </div>
    </div>
  );
}
