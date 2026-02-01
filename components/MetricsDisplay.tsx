'use client';

import { useTypingStore } from '@/lib/store/typing-store';

export default function MetricsDisplay() {
  const { wpm, accuracy, userInput, targetText } = useTypingStore();
  
  const progress = targetText.length > 0 
    ? Math.round((userInput.length / targetText.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* WPM */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          WPM
        </div>
        <div className="mt-2 text-4xl font-bold text-gray-900">
          {wpm}
        </div>
      </div>

      {/* Accuracy */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Accuracy
        </div>
        <div className="mt-2 text-4xl font-bold text-gray-900">
          {accuracy}%
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Progress
        </div>
        <div className="mt-2 text-4xl font-bold text-gray-900">
          {progress}%
        </div>
      </div>
    </div>
  );
}
