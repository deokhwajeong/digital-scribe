'use client';

import { useEffect, useRef } from 'react';
import { useTypingStore } from '@/lib/store/typing-store';

export default function TypingEngine() {
  const {
    userInput,
    targetText,
    setUserInput,
    startTyping,
  } = useTypingStore();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus on mount
    inputRef.current?.focus();
  }, []);

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
    if (index >= userInput.length) {
      return 'text-gray-400'; // Not yet typed
    }
    
    if (userInput[index] === targetText[index]) {
      return 'text-green-600 bg-green-50'; // Correct
    }
    
    return 'text-red-600 bg-red-50'; // Incorrect
  };

  return (
    <div className="w-full space-y-6">
      {/* Target text display with highlighting */}
      <div 
        ref={containerRef}
        onClick={focusInput}
        className="typing-display relative cursor-text rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-300 transition-colors"
      >
        <div className="font-mono text-lg leading-relaxed tracking-wide">
          {targetText.split('').map((char, index) => (
            <span
              key={index}
              className={`${getCharacterClassName(index)} transition-colors duration-150`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden textarea for input */}
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        className="sr-only"
        placeholder="Start typing..."
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {/* Instruction text */}
      <div className="text-center text-sm text-gray-500">
        {userInput.length === 0 ? 'Click the text above to start typing' : `${userInput.length} / ${targetText.length} characters`}
      </div>
    </div>
  );
}
