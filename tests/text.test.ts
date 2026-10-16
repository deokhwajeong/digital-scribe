import { describe, expect, it } from 'vitest';
import { cleanFileText, cleanOcrText, parseCsv, rowsToText } from '@/lib/text';

describe('cleanOcrText', () => {
  it('joins wrapped lines and keeps paragraph breaks', () => {
    const raw = 'The keeper kept\ntwo notebooks.\n\n  In the first   he\nwrote the weather.\n';
    expect(cleanOcrText(raw)).toBe('The keeper kept two notebooks.\nIn the first he wrote the weather.');
  });

  it('returns an empty string for whitespace', () => {
    expect(cleanOcrText(' \n\n ')).toBe('');
  });
});

describe('cleanFileText', () => {
  it('normalizes Windows and old Mac line endings', () => {
    expect(cleanFileText('a\r\nb\rc\n')).toBe('a\nb\nc');
  });
});

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, commas and newlines in fields', () => {
    const csv = '﻿title,body\r\n"Hello, world","She said ""hi""\nthen left"\r\nlast,row';
    expect(parseCsv(csv)).toEqual([
      ['title', 'body'],
      ['Hello, world', 'She said "hi"\nthen left'],
      ['last', 'row'],
    ]);
  });
});

describe('rowsToText', () => {
  it('drops empty cells and rows', () => {
    expect(rowsToText([['a', '', null, 'b'], [], ['  '], [1, 'c']])).toBe('a b\n1 c');
  });
});
