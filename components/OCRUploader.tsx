'use client';

import { useRef, useState } from 'react';
import { Camera, ImageIcon, X, Loader2 } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';
import Tesseract from 'tesseract.js';

export default function OCRUploader() {
  const { setTargetText, reset } = useTypingStore();
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
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('이미지 크기는 10MB 이하여야 합니다.');
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
        throw new Error('이미지에서 텍스트를 찾을 수 없습니다. 다른 이미지를 시도해보세요.');
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
      setError(err instanceof Error ? err.message : 'OCR 처리 중 오류가 발생했습니다.');
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
          <span className="text-sm font-medium">책 페이지 촬영/업로드 (OCR)</span>
        </button>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative rounded-lg border border-gray-200 overflow-hidden">
            <img
              src={preview}
              alt="OCR Preview"
              className="w-full max-h-64 object-contain bg-gray-100"
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
            <span className="text-sm text-gray-600">언어:</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as typeof selectedLang)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              disabled={isProcessing}
            >
              <option value="eng">English</option>
              <option value="kor">한국어</option>
              <option value="eng+kor">English + 한국어</option>
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
                텍스트 인식 중... {progress}%
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
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                <span>텍스트 추출하기</span>
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
