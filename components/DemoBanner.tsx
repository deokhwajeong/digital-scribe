'use client';

import { Info } from 'lucide-react';
import { IS_DEMO } from '@/lib/demo';
import { useI18n } from '@/lib/i18n/use-i18n';

export default function DemoBanner() {
  const { t } = useI18n();
  if (!IS_DEMO) return null;

  return (
    <div
      role="note"
      className="flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm"
    >
      <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t('demo.banner')}</span>
    </div>
  );
}
