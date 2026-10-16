'use client';

import { useEffect, useState } from 'react';
import { useTypingStore } from '@/lib/store/typing-store';
import { Zap, Target, TrendingUp, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n/use-i18n';
import { computeSpeed, formatElapsed, toChars } from '@/lib/metrics';

export default function MetricsDisplay() {
  const { accuracy, totalChars, correctChars, targetText, startTime, endTime, speedUnit } = useTypingStore();
  const { t } = useI18n();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startTime || endTime) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [startTime, endTime]);
  
  const targetLength = toChars(targetText).length;
  const progress = targetLength > 0 ? Math.round((totalChars / targetLength) * 100) : 0;

  // The clock stops when the passage is finished. `now` can briefly lag
  // behind startTime before the first tick, so elapsed is clamped at 0.
  const elapsedMs = startTime ? Math.max(0, (endTime ?? now) - startTime) : 0;
  const timeDisplay = formatElapsed(elapsedMs);
  const speed = computeSpeed(correctChars, elapsedMs, speedUnit);
  // Rough CPM equivalents of the WPM color bands (1 word ~ 5 chars is too
  // generous for CJK, so use a gentler multiplier).
  const speedScale = speedUnit === 'wpm' ? 1 : 3;

  // Get accuracy color
  const getAccuracyColor = () => {
    if (accuracy >= 95) return 'text-emerald-600';
    if (accuracy >= 85) return 'text-blue-600';
    if (accuracy >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  // Get WPM color
  const getWpmColor = () => {
    if (speed >= 60 * speedScale) return 'text-emerald-600';
    if (speed >= 40 * speedScale) return 'text-blue-600';
    if (speed >= 20 * speedScale) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* WPM */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 text-blue-500" />
          <span>{t(`metrics.${speedUnit}`)}</span>
        </div>
        <div className={`mt-2 text-3xl font-bold tabular-nums ${getWpmColor()}`} data-testid="metric-speed">
          {speed}
        </div>
        <div className="mt-1 text-xs text-gray-400">{t(`metrics.${speedUnit}Desc`)}</div>
      </div>

      {/* Accuracy */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Target className="h-3.5 w-3.5 text-emerald-500" />
          <span>{t('metrics.accuracy')}</span>
        </div>
        <div className={`mt-2 text-3xl font-bold tabular-nums ${getAccuracyColor()}`}>
          <span data-testid="metric-accuracy">{accuracy}</span><span className="text-lg">%</span>
        </div>
        <div className="mt-1 text-xs text-gray-400">{t('metrics.accuracyDesc')}</div>
      </div>

      {/* Progress */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
          <span>{t('metrics.progress')}</span>
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-purple-600">
          {progress}<span className="text-lg">%</span>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {t('metrics.progressDesc', { typed: totalChars, total: targetLength })}
        </div>
      </div>

      {/* Time */}
      <div className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-200">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span>{t('metrics.time')}</span>
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-amber-600">
          {timeDisplay}
        </div>
        <div className="mt-1 text-xs text-gray-400">{t('metrics.timeDesc')}</div>
      </div>
    </div>
  );
}
