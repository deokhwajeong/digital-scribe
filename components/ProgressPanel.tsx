'use client';

import { useEffect, useState } from 'react';
import { History, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import ProgressChart from '@/components/ProgressChart';
import { useHistoryStore } from '@/lib/store/history-store';
import { useI18n } from '@/lib/i18n/use-i18n';
import { sessionsFor, summarize } from '@/lib/history';
import { formatElapsed } from '@/lib/metrics';
import { localeNames, locales, type Locale } from '@/lib/i18n/config';

const CHART_SESSIONS = 30;

export default function ProgressPanel() {
  const { t, locale } = useI18n();
  const { sessions, loaded, load, clear } = useHistoryStore();
  // Follows the UI language, but the user can look at another one until the
  // UI language changes again.
  const [picked, setPicked] = useState<{ forLocale: Locale; language: Locale } | null>(null);
  const language = picked?.forLocale === locale ? picked.language : locale;
  const setLanguage = (lang: Locale) => setPicked({ forLocale: locale, language: lang });

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  const filtered = sessionsFor(sessions, language);
  const recent = filtered.slice(-CHART_SESSIONS);
  const summary = summarize(filtered);
  const unitKey = language === 'en' ? 'wpm' : 'cpm';
  const unit = t(`metrics.${unitKey}`);
  const dateFmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  const handleClear = () => {
    if (window.confirm(t('history.clearConfirm'))) clear();
  };

  return (
    <section aria-labelledby="history-title" className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6" data-testid="progress-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-title" className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <History className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          {t('history.title')}
        </h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1" role="group" aria-label={t('history.languageFilter')}>
          {locales.map((lang) => (
            <button
              key={lang}
              lang={lang}
              aria-pressed={language === lang}
              onClick={() => setLanguage(lang)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-blue-600 ${
                language === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {localeNames[lang]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600" data-testid="history-empty">
          {t('history.empty')}
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">{t('history.sessions')}</dt>
              <dd className="text-xl font-bold tabular-nums text-gray-900" data-testid="history-count">{summary.count}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">{t('history.best', { unit })}</dt>
              <dd className="text-xl font-bold tabular-nums text-gray-900">{summary.bestSpeed}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">{t('history.recent', { unit })}</dt>
              <dd className="flex items-center gap-1 text-xl font-bold tabular-nums text-gray-900">
                {summary.recentSpeed}
                {summary.speedTrend !== null && summary.speedTrend !== 0 && (
                  <span className={`inline-flex items-center text-xs font-medium ${summary.speedTrend > 0 ? 'text-emerald-700' : 'text-gray-600'}`}>
                    {summary.speedTrend > 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
                    {summary.speedTrend > 0 ? `+${summary.speedTrend}` : summary.speedTrend}
                  </span>
                )}
              </dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">{t('history.recentAccuracy')}</dt>
              <dd className="text-xl font-bold tabular-nums text-gray-900">{summary.recentAccuracy}%</dd>
            </div>
          </dl>

          <div className="grid gap-3 sm:grid-cols-2">
            <ProgressChart
              title={t('history.speedChart', { unit })}
              colorClass="stroke-indigo-600"
              points={recent.map((s) => ({ value: s.speed, label: `${dateFmt.format(s.finishedAt)}: ${s.speed} ${unit}` }))}
            />
            <ProgressChart
              title={t('history.accuracyChart')}
              colorClass="stroke-emerald-600"
              yMax={100}
              suffix="%"
              points={recent.map((s) => ({ value: s.accuracy, label: `${dateFmt.format(s.finishedAt)}: ${s.accuracy}%` }))}
            />
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">{t('history.table')}</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-gray-500">
                  <tr>
                    <th scope="col" className="py-1 pr-3 font-medium">{t('history.colDate')}</th>
                    <th scope="col" className="py-1 pr-3 font-medium">{unit}</th>
                    <th scope="col" className="py-1 pr-3 font-medium">{t('results.accuracy')}</th>
                    <th scope="col" className="py-1 pr-3 font-medium">{t('results.mistakes')}</th>
                    <th scope="col" className="py-1 pr-3 font-medium">{t('results.time')}</th>
                    <th scope="col" className="py-1 font-medium">{t('history.colPassage')}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums text-gray-800">
                  {[...filtered].reverse().slice(0, 10).map((s) => (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="whitespace-nowrap py-1 pr-3">{dateFmt.format(s.finishedAt)}</td>
                      <td className="py-1 pr-3">{s.speed}</td>
                      <td className="py-1 pr-3">{s.accuracy}%</td>
                      <td className="py-1 pr-3">{s.mistakes}</td>
                      <td className="py-1 pr-3">{formatElapsed(s.durationMs)}</td>
                      <td className="max-w-[12rem] truncate py-1">{s.preview}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
            <span>{t('history.storedLocally')}</span>
            <button onClick={handleClear} className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-blue-600">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t('history.clear')}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
