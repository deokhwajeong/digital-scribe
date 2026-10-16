import { describe, expect, it } from 'vitest';
import en from '@/lib/i18n/messages/en.json';
import ko from '@/lib/i18n/messages/ko.json';
import ja from '@/lib/i18n/messages/ja.json';
import { texts } from '@/data/texts';
import { locales } from '@/lib/i18n/config';

type Tree = { [key: string]: string | Tree };

const keys = (tree: Tree, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : keys(value, `${prefix}${key}.`),
  );

describe('i18n messages', () => {
  it('every locale has exactly the same keys as English', () => {
    const base = keys(en).sort();
    expect(keys(ko).sort()).toEqual(base);
    expect(keys(ja).sort()).toEqual(base);
  });
});

describe('sample passages', () => {
  it('ships at least one passage per locale with unique ids', () => {
    for (const locale of locales) {
      expect(texts.some((text) => text.language === locale)).toBe(true);
    }
    expect(new Set(texts.map((text) => text.id)).size).toBe(texts.length);
  });
});
