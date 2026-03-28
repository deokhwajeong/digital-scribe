'use client';

import { useTypingStore } from '@/lib/store/typing-store';
import { useI18n } from '@/lib/i18n/use-i18n';

export default function ResetButton() {
  const { reset } = useTypingStore();
  const { t } = useI18n();

  return (
    <button
      onClick={reset}
      className="rounded-md bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
    >
      {t('reset.button')}
    </button>
  );
}
