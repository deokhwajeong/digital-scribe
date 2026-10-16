'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, X, FileSpreadsheet } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';
import { useI18n } from '@/lib/i18n/use-i18n';
import { cleanFileText, parseCsv, rowsToText } from '@/lib/text';

export default function FileUploader() {
  const { setTargetText } = useTypingStore();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseSpreadsheet = async (file: File, isCsv: boolean): Promise<string> => {
    if (isCsv) {
      return rowsToText(parseCsv(await file.text()));
    }
    // Loaded on demand so the parser is not part of the initial bundle.
    const { default: readXlsxFile } = await import('read-excel-file/browser');
    const sheets = await readXlsxFile(file);
    return sheets
      .map((sheet) => rowsToText(sheet.data))
      .filter(Boolean)
      .join('\n\n');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check file type
      const textTypes = ['text/plain', 'text/markdown', 'application/json'];
      const textExtensions = ['.txt', '.md', '.json'];
      const excelExtensions = ['.xlsx', '.csv'];
      const excelTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
      
      const isTextFile = textTypes.includes(file.type) || 
        textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      const isExcelFile = excelTypes.includes(file.type) ||
        excelExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isTextFile && !isExcelFile) {
        throw new Error(t('fileUploader.unsupported'));
      }

      // Check file size (max 5MB for excel, 1MB for text)
      const maxSize = isExcelFile ? 5 * 1024 * 1024 : 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(t('fileUploader.maxSize', { size: isExcelFile ? '5MB' : '1MB' }));
      }

      let text: string;
      
      if (isExcelFile) {
        text = await parseSpreadsheet(file, isCsv);
      } else {
        text = await file.text();
      }
      
      // Clean up the text
      const cleanedText = cleanFileText(text);

      if (!cleanedText) {
        throw new Error(t('fileUploader.empty'));
      }

      setTargetText(cleanedText);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('fileUploader.readError'));
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

  const isExcel = fileName?.match(/\.(xlsx|csv)$/i);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.xlsx,.csv,text/plain,text/markdown,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {fileName ? (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-green-700">
            {isExcel ? (
              <FileSpreadsheet className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <button
            onClick={clearFile}
            aria-label={t('fileUploader.clear')}
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
            {isLoading ? t('fileUploader.loading') : t('fileUploader.uploadLabel')}
          </span>
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
