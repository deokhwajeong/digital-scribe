/** Text cleanup helpers shared by the file and OCR sources. */

/** Collapse OCR line wraps into flowing text while keeping paragraph breaks. */
export const cleanOcrText = (raw: string): string =>
  raw
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');

/** Normalize line endings and trim a plain text file. */
export const cleanFileText = (raw: string): string => raw.replace(/\r\n?/g, '\n').trim();

/** Join spreadsheet rows into practice text: one line per non-empty row. */
export const rowsToText = (rows: ReadonlyArray<ReadonlyArray<unknown>>): string =>
  rows
    .map((row) =>
      row
        .filter((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '')
        .map((cell) => String(cell).trim())
        .join(' '),
    )
    .filter((line) => line !== '')
    .join('\n');

/**
 * Minimal RFC 4180 CSV parser: quoted fields, escaped quotes ("") and
 * newlines inside quotes. Enough for practice text, no dependency needed.
 */
export const parseCsv = (input: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const text = input.replace(/^﻿/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};
