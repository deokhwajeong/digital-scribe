'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, X, FileSpreadsheet } from 'lucide-react';
import { useTypingStore } from '@/lib/store/typing-store';
import * as XLSX from 'xlsx';

export default function FileUploader() {
  const { setTargetText, reset } = useTypingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseExcelFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get all sheet names
    const sheetNames = workbook.SheetNames;
    
    // Extract text from all sheets
    const allText: string[] = [];
    
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to array of arrays
      const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
      
      // Filter out empty rows and join cells
      const sheetText = data
        .filter((row: string[]) => row && row.length > 0)
        .map((row: string[]) => 
          row
            .filter(cell => cell !== null && cell !== undefined && cell !== '')
            .join(' ')
        )
        .filter(line => line.trim() !== '')
        .join('\n');
      
      if (sheetText) {
        allText.push(sheetText);
      }
    }
    
    return allText.join('\n\n');
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
      const excelExtensions = ['.xlsx', '.xls', '.csv'];
      const excelTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      const isTextFile = textTypes.includes(file.type) || 
        textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      const isExcelFile = excelTypes.includes(file.type) ||
        excelExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isTextFile && !isExcelFile) {
        throw new Error('지원하지 않는 파일 형식입니다. (.txt, .md, .xlsx, .xls, .csv 파일만 가능)');
      }

      // Check file size (max 5MB for excel, 1MB for text)
      const maxSize = isExcelFile ? 5 * 1024 * 1024 : 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`파일 크기는 ${isExcelFile ? '5MB' : '1MB'} 이하여야 합니다.`);
      }

      let text: string;
      
      if (isExcelFile) {
        text = await parseExcelFile(file);
      } else {
        text = await file.text();
      }
      
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

  const isExcel = fileName?.match(/\.(xlsx|xls|csv)$/i);

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.xlsx,.xls,.csv,text/plain,text/markdown,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
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
            {isLoading ? '파일 읽는 중...' : '파일 업로드 (.txt, .md, .xlsx, .csv)'}
          </span>
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
