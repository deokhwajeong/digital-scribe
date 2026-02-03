'use client';

import { useEffect, useRef, useState } from 'react';
import { useTypingStore } from '@/lib/store/typing-store';
import { Keyboard, Eye, EyeOff } from 'lucide-react';

export default function TypingEngine() {
  const {
    userInput,
    targetText,
    setUserInput,
    startTyping,
  } = useTypingStore();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  useEffect(() => {
    // Focus on mount
    inputRef.current?.focus();
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
  }, [userInput.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    
    // Don't allow input longer than target text
    if (input.length <= targetText.length) {
      setUserInput(input);
      
      // Start timer on first input
      if (input.length === 1) {
        startTyping();
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const getCharacterClassName = (index: number): string => {
    const baseClass = 'inline-block transition-all duration-100';
    
    if (index >= userInput.length) {
      return `${baseClass} text-gray-400`; // Not yet typed
    }
    
    if (userInput[index] === targetText[index]) {
      return `${baseClass} text-emerald-600 bg-emerald-50 rounded-sm`; // Correct
    }
    
    return `${baseClass} text-red-500 bg-red-100 rounded-sm underline decoration-red-400 decoration-2`; // Incorrect
  };

  const isCompleted = userInput.length === targetText.length && targetText.length > 0;
  const progressPercent = targetText.length > 0 ? (userInput.length / targetText.length) * 100 : 0;

  // Split text into lines for better display
  const renderText = () => {
    if (!targetText) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Keyboard className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg">텍스트를 선택하거나 업로드하세요</p>
          <p className="text-sm mt-1">파일 업로드 또는 OCR 기능을 사용해보세요</p>
        </div>
      );
    }

    return (
      <div className="font-mono text-lg leading-[2] tracking-wide whitespace-pre-wrap break-all">
        {targetText.split('').map((char, index) => {
          const isCursor = index === userInput.length;
          return (
            <span
              key={index}
              ref={isCursor ? cursorRef : null}
              className={`${getCharacterClassName(index)} ${
                isCursor && isFocused ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              }`}
            >
              {char === ' ' ? '\u00A0' : char === '\n' ? '↵\n' : char}
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
            <span className="text-gray-500">진행률</span>
            <span className="font-medium text-gray-700">
              {userInput.length} / {targetText.length} 글자
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
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
        className={`typing-display relative cursor-text rounded-xl border-2 bg-white p-6 transition-all duration-200 ${
          showFullText ? 'max-h-none' : 'max-h-80'
        } overflow-y-auto scroll-smooth ${
          isFocused 
            ? 'border-blue-400 shadow-lg shadow-blue-100' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        } ${isCompleted ? 'border-emerald-400 shadow-emerald-100' : ''}`}
      >
        {renderText()}
        
        {/* Completion overlay */}
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/90 rounded-xl">
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xl font-bold text-emerald-600">완료!</p>
              <p className="text-sm text-emerald-500 mt-1">훌륭합니다! 리셋 버튼을 눌러 다시 시작하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* Show more/less toggle for long texts */}
      {targetText && targetText.length > 500 && (
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mx-auto"
        >
          {showFullText ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>접기</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>전체 보기</span>
            </>
          )}
        </button>
      )}

      {/* Hidden textarea for input */}
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="sr-only"
        placeholder="Start typing..."
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {/* Instruction text */}
      <div className="text-center text-sm">
        {!targetText ? (
          <span className="text-gray-400">위에서 텍스트를 선택하세요</span>
        ) : userInput.length === 0 ? (
          <span className="text-blue-500 animate-pulse">
            👆 위 텍스트를 클릭하고 타이핑을 시작하세요
          </span>
        ) : !isFocused ? (
          <span className="text-amber-500">
            ⚠️ 텍스트 영역을 클릭하여 타이핑을 계속하세요
          </span>
        ) : (
          <span className="text-gray-500">
            타이핑 중...
          </span>
        )}
      </div>
    </div>
  );
}
