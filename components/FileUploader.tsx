'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';

export default function FileUploader() {
  const { setTargetText, reset } = useTypingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check file type
      const validTypes = ['text/plain', 'text/markdown', 'application/json'];
      const validExtensions = ['.txt', '.md', '.json'];
      
      const isValidType = validTypes.includes(file.type) || 
        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        throw new Error('지원하지 않는 파일 형식입니다. (.txt, .md, .json 파일만 가능)');
      }

      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        throw new Error('파일 크기는 1MB 이하여야 합니다.');
      }

      const text = await file.text();
      
      // Clean up the text
      const cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();

      if (!cleanedText) {
        throw new Error('파일이 비어 있습니다.');
      }

      reset();
      setTargetText(cleanedText);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,text/plain,text/markdown,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {fileName ? (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-green-700">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <button
            onClick={clearFile}
            className="rounded-full p-1 text-green-600 hover:bg-green-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isLoading ? '파일 읽는 중...' : '텍스트 파일 업로드 (.txt, .md)'}
          </span>
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
