/**
 * Self-hosted OCR assets. Tesseract.js normally downloads its worker, WASM
 * core and language data from a public CDN at run time. Digital Scribe copies
 * them into public/tesseract/ at build time (scripts/copy-ocr-assets.mjs) so
 * custom-image OCR works offline and on the static demo without third-party
 * requests.
 */
export type OcrLang = 'eng' | 'kor' | 'jpn' | 'eng+kor';

export const OCR_LANGS = ['eng', 'kor', 'jpn'] as const;

export interface OcrAssetPaths {
  workerPath: string;
  /** Directory: Tesseract.js picks the SIMD or plain LSTM core inside it. */
  corePath: string;
  /** Directory holding <lang>.traineddata.gz files. */
  langPath: string;
}

/**
 * Absolute URLs, because the worker resolves relative paths against its own
 * script location rather than the page.
 */
export const ocrAssetPaths = (origin: string, basePath = ''): OcrAssetPaths => {
  const root = `${origin.replace(/\/$/, '')}${basePath.replace(/\/$/, '')}/tesseract`;
  return {
    workerPath: `${root}/worker.min.js`,
    corePath: `${root}/core`,
    langPath: `${root}/lang`,
  };
};

/** Individual language codes in a Tesseract language string such as eng+kor. */
export const splitOcrLang = (lang: OcrLang): string[] => lang.split('+');
