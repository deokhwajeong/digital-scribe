'use client';

import { useMemo } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';
import { useHistoryStore } from '@/lib/store/history-store';
import { useI18n } from '@/lib/i18n/use-i18n';
import { formatElapsed, toChars } from '@/lib/metrics';
import { heatLevel, topMissedChars } from '@/lib/mistakes';
import { sessionsFor } from '@/lib/history';

// One hue, light to dark: more mistakes means a darker cell.
const HEAT_CLASSES = [
  'text-gray-700',
  'bg-rose-100 text-rose-900',
  'bg-rose-300 text-rose-950',
  'bg-rose-600 text-white',
] as const;

const visibleChar = (char: string) => (char === ' ' ? '·' : char === '\n' ? '↵\n' : char);

export default function SessionResults() {
  const { t } = useI18n();
  const { lastSession, mistakes, targetText, reset } = useTypingStore();
  const sessions = useHistoryStore((s) => s.sessions);
  const chars = useMemo(() => toChars(targetText), [targetText]);

  if (!lastSession) return null;

  const missed = topMissedChars(mistakes, targetText);
  const previous = sessionsFor(sessions, lastSession.language).filter((s) => s.id !== lastSession.id);
  const previousBest = previous.reduce((best, s) => Math.max(best, s.speed), 0);
  const isBest = previous.length > 0 && lastSession.speed > previousBest;
  const unit = t(`metrics.${lastSession.unit}`);

  const stats = [
    { label: unit, value: String(lastSession.speed) },
    { label: t('results.accuracy'), value: `${lastSession.accuracy}%` },
    { label: t('results.firstTry'), value: `${lastSession.firstTryAccuracy}%` },
    { label: t('results.mistakes'), value: String(lastSession.mistakes) },
    { label: t('results.time'), value: formatElapsed(lastSession.durationMs) },
  ];

  return (
    <section
      aria-labelledby="results-title"
      data-testid="session-results"
      className="space-y-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="status">
          <h2 id="results-title" className="text-lg font-bold text-emerald-700">
            {t('typing.completed')}
          </h2>
          <p className="text-sm text-gray-500">
            {isBest ? (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                {t('results.newBest', { previous: previousBest, unit })}
              </span>
            ) : (
              t('results.savedHint')
            )}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t('results.again')}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-gray-50 p-3">
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800">{t('results.heatmapTitle')}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600" aria-hidden="true">
            <span>{t('results.legendNone')}</span>
            {HEAT_CLASSES.slice(1).map((cls, i) => (
              <span key={cls} className={`inline-flex h-5 w-6 items-center justify-center rounded ${cls}`}>
                {i === 2 ? '3+' : i + 1}
              </span>
            ))}
          </div>
        </div>
        <p
          className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 p-4 font-mono text-base leading-8"
          data-testid="mistake-heatmap"
        >
          {chars.map((char, i) => {
            const count = mistakes[i];
            const level = heatLevel(count);
            return (
              <span
                key={i}
                className={`rounded-sm ${HEAT_CLASSES[level]} ${level > 0 ? 'px-px' : ''}`}
                title={level > 0 ? t('results.cellTitle', { count: count ?? 0 }) : undefined}
                data-heat={level || undefined}
              >
                {level > 0 ? visibleChar(char) : char}
              </span>
            );
          })}
        </p>
        <p className="text-sm text-gray-600">
          {missed.length === 0
            ? t('results.noMistakes')
            : t('results.topMissed', {
                list: missed.map((m) => `"${m.char}" ×${m.count}`).join(', '),
              })}
        </p>
      </div>
    </section>
  );
}
