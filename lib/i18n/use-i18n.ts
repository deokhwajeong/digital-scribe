'use client';

import en from '@/lib/i18n/messages/en.json';
import ko from '@/lib/i18n/messages/ko.json';
import ja from '@/lib/i18n/messages/ja.json';
import { useLocaleStore } from '@/lib/store/locale-store';
import type { Locale } from '@/lib/i18n/config';

interface MessageTree {
  [key: string]: string | MessageTree;
}

const messageMap: Record<Locale, MessageTree> = {
  en,
  ko,
  ja,
};

const getNestedValue = (obj: MessageTree, path: string): string | undefined => {
  const parts = path.split('.');
  let current: string | MessageTree | undefined = obj;

  for (const part of parts) {
    if (!current || typeof current === 'string') {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
};

const formatMessage = (template: string, params?: Record<string, string | number>) => {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
};

export const useI18n = () => {
  const { locale, setLocale } = useLocaleStore();

  const t = (key: string, params?: Record<string, string | number>) => {
    const message = getNestedValue(messageMap[locale], key) ?? getNestedValue(messageMap.en, key) ?? key;
    return formatMessage(message, params);
  };

  return { locale, setLocale, t };
};
