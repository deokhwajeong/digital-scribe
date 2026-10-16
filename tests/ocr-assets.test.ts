import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OCR_LANGS, ocrAssetPaths, splitOcrLang } from '@/lib/ocr-assets';

describe('ocrAssetPaths', () => {
  it('builds absolute same-origin URLs under the base path', () => {
    expect(ocrAssetPaths('https://example.github.io', '/demos/digital-scribe')).toEqual({
      workerPath: 'https://example.github.io/demos/digital-scribe/tesseract/worker.min.js',
      corePath: 'https://example.github.io/demos/digital-scribe/tesseract/core',
      langPath: 'https://example.github.io/demos/digital-scribe/tesseract/lang',
    });
  });

  it('handles an empty base path and trailing slashes', () => {
    expect(ocrAssetPaths('http://localhost:3000/', '').workerPath).toBe('http://localhost:3000/tesseract/worker.min.js');
    expect(ocrAssetPaths('http://localhost:3000', '/x/').langPath).toBe('http://localhost:3000/x/tesseract/lang');
  });

  it('splits combined language strings', () => {
    expect(splitOcrLang('eng+kor')).toEqual(['eng', 'kor']);
  });
});

describe('bundled OCR source packages', () => {
  // The copy script reads these at build time; fail fast if one goes missing.
  it('has language data for every selectable language', () => {
    for (const lang of OCR_LANGS) {
      const file = join(process.cwd(), 'node_modules', '@tesseract.js-data', lang, '4.0.0_best_int', `${lang}.traineddata.gz`);
      expect(existsSync(file)).toBe(true);
    }
  });

  it('has the worker and the cores', () => {
    expect(existsSync(join(process.cwd(), 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'))).toBe(true);
    for (const core of ['tesseract-core-relaxedsimd.wasm.js', 'tesseract-core-simd.wasm.js', 'tesseract-core.wasm.js']) {
      expect(existsSync(join(process.cwd(), 'node_modules', 'tesseract.js-core', core))).toBe(true);
    }
  });
});
