'use client';

import { useTypingStore } from '@/lib/store/typing-store';
import { Zap, Target, TrendingUp, Clock } from 'lucide-react';

export default function MetricsDisplay() {
  const { wpm, accuracy, userInput, targetText, startTime } = useTypingStore();
  
  const progress = targetText.length > 0 
    ? Math.round((userInput.length / targetText.length) * 100)
    : 0;

  // Calculate elapsed time
  const elapsedSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Get accuracy color
  const getAccuracyColor = () => {
    if (accuracy >= 95) return 'text-emerald-600';
    if (accuracy >= 85) return 'text-blue-600';
    if (accuracy >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  // Get WPM color
  const getWpmColor = () => {
    if (wpm >= 60) return 'text-emerald-600';
    if (wpm >= 40) return 'text-blue-600';
    if (wpm >= 20) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* WPM */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 text-blue-500" />
          <span>WPM</span>
        </div>
        <div className={`mt-2 text-3xl font-bold tabular-nums ${getWpmColor()}`}>
          {wpm}
        </div>
        <div className="mt-1 text-xs text-gray-400">분당 단어</div>
      </div>

      {/* Accuracy */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Target className="h-3.5 w-3.5 text-emerald-500" />
          <span>정확도</span>
        </div>
        <div className={`mt-2 text-3xl font-bold tabular-nums ${getAccuracyColor()}`}>
          {accuracy}<span className="text-lg">%</span>
        </div>
        <div className="mt-1 text-xs text-gray-400">정확한 입력</div>
      </div>

      {/* Progress */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
          <span>진행률</span>
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-purple-600">
          {progress}<span className="text-lg">%</span>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {userInput.length}/{targetText.length}자
        </div>
      </div>

      {/* Time */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span>시간</span>
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-amber-600">
          {timeDisplay}
        </div>
        <div className="mt-1 text-xs text-gray-400">경과 시간</div>
      </div>
    </div>
  );
}
