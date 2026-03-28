'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trophy, Flame, Timer, Star, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/use-i18n';

const GAME_DURATION_SECONDS = 60;

const EASY_WORDS = [
  'cat',
  'dog',
  'sun',
  'moon',
  'star',
  'tree',
  'book',
  'milk',
  'rain',
  'bird',
  'fish',
  'apple',
  'grape',
  'smile',
  'happy',
  'robot',
  'tiger',
  'zebra',
  'cloud',
  'magic',
];

const shuffle = (words: string[]) => {
  const copied = [...words];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
};

export default function KidsTypingGame() {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [clearedWords, setClearedWords] = useState(0);
  const [input, setInput] = useState('');
  const [wordQueue, setWordQueue] = useState<string[]>(() => shuffle(EASY_WORDS));

  const currentWord = wordQueue[0] ?? '';

  const titleClass = useMemo(() => {
    if (streak >= 8) return 'text-pink-600';
    if (streak >= 5) return 'text-orange-500';
    if (streak >= 3) return 'text-sky-600';
    return 'text-gray-700';
  }, [streak]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPlaying, timeLeft]);

  const handleInputChange = (value: string) => {
    if (!isPlaying || !currentWord) {
      return;
    }

    const normalized = value.replace(/\s+/g, '').toLowerCase();

    if (normalized === currentWord) {
      const nextStreak = streak + 1;
      const gainedScore = 10 + Math.min(nextStreak * 2, 20);

      setScore((prev) => prev + gainedScore);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setClearedWords((prev) => prev + 1);
      setInput('');
      setWordQueue((prev) => {
        if (prev.length <= 1) {
          return shuffle(EASY_WORDS);
        }
        return prev.slice(1);
      });

      return;
    }

    setInput(normalized);
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setClearedWords(0);
    setInput('');
    setWordQueue(shuffle(EASY_WORDS));
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  const progressPercent = Math.round(((GAME_DURATION_SECONDS - timeLeft) / GAME_DURATION_SECONDS) * 100);

  return (
    <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-amber-50 via-pink-50 to-sky-100 p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-orange-600">
            <Sparkles className="h-3.5 w-3.5" />
            {t('kids.badge')}
          </p>
          <h2 className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl">{t('kids.title')}</h2>
          <p className="mt-1 text-sm text-gray-600">{t('kids.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              {t('kids.start')}
            </button>
          ) : (
            <button
              onClick={stopGame}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              {t('kids.pause')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Trophy className="h-4 w-4 text-amber-500" />
            {t('kids.score')}
          </p>
          <p className="mt-2 text-3xl font-black text-amber-600">{score}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Flame className="h-4 w-4 text-orange-500" />
            {t('kids.streak')}
          </p>
          <p className={`mt-2 text-3xl font-black ${titleClass}`}>{streak}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Star className="h-4 w-4 text-yellow-500" />
            {t('kids.best')}
          </p>
          <p className="mt-2 text-3xl font-black text-sky-600">{bestStreak}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Timer className="h-4 w-4 text-rose-500" />
            {t('kids.time')}
          </p>
          <p className="mt-2 text-3xl font-black text-rose-600">{timeLeft}s</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 transition-all duration-500"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm sm:p-7">
        <p className="text-center text-sm font-semibold text-gray-500">{t('kids.currentWord')}</p>
        <p className="mt-2 text-center text-4xl font-black tracking-widest text-gray-900 sm:text-5xl">{currentWord || '-'}</p>

        <input
          value={input}
          disabled={!isPlaying || timeLeft <= 0}
          onChange={(e) => handleInputChange(e.currentTarget.value)}
          placeholder={isPlaying ? t('kids.inputPlaying') : t('kids.inputIdle')}
          className="mt-5 w-full rounded-xl border-2 border-orange-200 bg-white px-4 py-3 text-center text-xl font-bold tracking-wide text-gray-900 outline-none transition focus:border-orange-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        />

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>{t('kids.cleared', { count: clearedWords })}</p>
          <p>{t('kids.bonus', { count: streak })}</p>
        </div>

        {!isPlaying && timeLeft <= 0 && (
          <p className="mt-4 text-center text-base font-bold text-emerald-600">
            {t('kids.result', { score })}
          </p>
        )}
      </div>
    </section>
  );
}
