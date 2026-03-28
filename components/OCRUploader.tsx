'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ImageIcon, X, Loader2 } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';
import { useI18n } from '@/lib/i18n/use-i18n';
import Tesseract from 'tesseract.js';

export default function OCRUploader() {
  const { setTargetText, reset } = useTypingStore();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'eng' | 'kor' | 'eng+kor'>('eng+kor');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError(t('ocr.imageOnly'));
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('ocr.maxSize'));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processOCR = async () => {
    if (!preview) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await Tesseract.recognize(
        preview,
        selectedLang,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          },
        }
      );

      const extractedText = result.data.text.trim();

      if (!extractedText) {
        throw new Error(t('ocr.notFound'));
      }

      // Clean up the text
      const cleanedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim();

      reset();
      setTargetText(cleanedText);
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
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-gray-600 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
        >
          <Camera className="h-5 w-5" />
          <span className="text-sm font-medium">{t('ocr.uploadLabel')}</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative h-64 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt={t('ocr.previewAlt')}
              fill
              unoptimized
              className="object-contain"
              sizes="100vw"
            />
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('ocr.language')}</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as typeof selectedLang)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              disabled={isProcessing}
            >
              <option value="eng">{t('language.en')}</option>
              <option value="kor">{t('language.ko')}</option>
              <option value="eng+kor">{t('ocr.bilingual')}</option>
            </select>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500">
                {t('ocr.recognizing', { progress })}
              </p>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={processOCR}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-white font-medium transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
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

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
