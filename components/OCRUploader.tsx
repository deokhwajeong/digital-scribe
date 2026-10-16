'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ImageIcon, X, Loader2, BookImage } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';
import { useI18n } from '@/lib/i18n/use-i18n';
import { IS_DEMO } from '@/lib/demo';
import { OCR_SAMPLE } from '@/data/ocr-sample';
import { cleanOcrText } from '@/lib/text';
import type { Locale } from '@/lib/i18n/config';
import { ocrAssetPaths, type OcrLang } from '@/lib/ocr-assets';

const LANG_FOR_LOCALE: Record<Locale, OcrLang> = { en: 'eng', ko: 'eng+kor', ja: 'jpn' };

interface Preview {
  src: string;
  isSample: boolean;
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function OCRUploader() {
  const { setTargetText } = useTypingStore();
  const { t, locale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<OcrLang>(LANG_FOR_LOCALE[locale]);

  // Object URLs must be released or they leak for the lifetime of the page.
  useEffect(() => {
    return () => {
      if (preview && !preview.isSample) URL.revokeObjectURL(preview.src);
    };
  }, [preview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setNotice(null);

    if (!file.type.startsWith('image/')) {
      setError(t('ocr.imageOnly'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('ocr.maxSize'));
      return;
    }

    setPreview({ src: URL.createObjectURL(file), isSample: false });
  };

  const loadSample = () => {
    setError(null);
    setNotice(null);
    setSelectedLang(OCR_SAMPLE.language);
    setPreview({ src: OCR_SAMPLE.imageSrc, isSample: true });
  };

  // Worker, WASM core and language data are served from this site
  // (public/tesseract, copied at build time), never from a third-party CDN.
  const recognizeWithTesseract = async (src: string): Promise<string> => {
    const { createWorker } = await import('tesseract.js');
    const paths = ocrAssetPaths(window.location.origin, process.env.NEXT_PUBLIC_BASE_PATH ?? '');
    const worker = await createWorker(selectedLang, 1, {
      ...paths,
      workerBlobURL: false,
      // Matches the full cores copied by scripts/copy-ocr-assets.mjs.
      legacyCore: true,
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
      errorHandler: () => undefined,
    });
    try {
      const result = await worker.recognize(src);
      return result.data.text;
    } finally {
      await worker.terminate();
    }
  };

  // The demo ships a precomputed result for the bundled page so no OCR
  // engine or language data has to be downloaded.
  const recognizeSample = async (): Promise<string> => {
    for (let step = 1; step <= 10; step++) {
      await sleep(90);
      setProgress(step * 10);
    }
    return OCR_SAMPLE.text;
  };

  const processOCR = async () => {
    if (!preview) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const useSample = preview.isSample && IS_DEMO;
      const raw = useSample ? await recognizeSample() : await recognizeWithTesseract(preview.src);
      const cleanedText = cleanOcrText(raw);

      if (!cleanedText) {
        throw new Error(t('ocr.notFound'));
      }

      setTargetText(cleanedText);
      setNotice(useSample ? t('ocr.sampleDone') : t('ocr.done'));
      clearPreview();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ocr.processError'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="ocr-file"
      />

      {!preview ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-gray-600 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
          >
            <Camera className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{t('ocr.uploadLabel')}</span>
          </button>
          <button
            onClick={loadSample}
            data-testid="ocr-sample"
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-purple-200 bg-purple-50 px-4 py-4 text-purple-700 transition-colors hover:border-purple-400 hover:bg-purple-100"
          >
            <BookImage className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{t('ocr.sample')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative h-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <Image
              src={preview.src}
              alt={preview.isSample ? OCR_SAMPLE.title : t('ocr.previewAlt')}
              fill
              unoptimized
              className="object-contain"
              sizes="100vw"
            />
            <button
              onClick={clearPreview}
              aria-label={t('ocr.clear')}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {preview.isSample && IS_DEMO ? (
            <p className="text-xs text-gray-500">{t('ocr.sampleHint')}</p>
          ) : (
            <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label htmlFor="ocr-lang" className="text-sm text-gray-600">{t('ocr.language')}</label>
              <select
                id="ocr-lang"
                data-testid="ocr-lang"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as OcrLang)}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={isProcessing}
              >
                <option value="eng">{t('language.en')}</option>
                <option value="kor">{t('language.ko')}</option>
                <option value="jpn">{t('language.ja')}</option>
                <option value="eng+kor">{t('ocr.bilingual')}</option>
              </select>
            </div>
            <p className="text-xs text-gray-500">{t('ocr.engineHint')}</p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-sm text-gray-500">{t('ocr.recognizing', { progress })}</p>
            </div>
          )}

          <button
            onClick={processOCR}
            disabled={isProcessing}
            data-testid="ocr-extract"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('ocr.processing')}</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                <span>{t('ocr.extract')}</span>
              </>
            )}
          </button>
        </div>
      )}

      <div aria-live="polite">
        {notice && !error && <p className="text-sm text-emerald-700" data-testid="ocr-notice">{notice}</p>}
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      </div>
    </div>
  );
}
