// Copies the Tesseract.js worker, LSTM cores and language data from
// node_modules into public/tesseract/ so OCR never needs a CDN.
// Runs automatically before dev, build and build:demo. Output is gitignored.
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'tesseract');

const pkgDir = (name) => dirname(require.resolve(`${name}/package.json`));

const copies = [
  [join(pkgDir('tesseract.js'), 'dist', 'worker.min.js'), join(out, 'worker.min.js')],
  // Full cores (the app sets legacyCore: true). The LSTM-only builds are
  // slightly smaller but print dozens of "Parameter not found" errors to the
  // console for every run, because the language files carry legacy settings.
  // Tesseract.js picks relaxed SIMD, SIMD or plain based on browser support.
  ...['tesseract-core-relaxedsimd.wasm.js', 'tesseract-core-simd.wasm.js', 'tesseract-core.wasm.js'].map(
    (file) => [join(pkgDir('tesseract.js-core'), file), join(out, 'core', file)],
  ),
  // best_int models are what Tesseract.js fetches by default for LSTM mode.
  ...['eng', 'kor', 'jpn'].map((lang) => [
    join(pkgDir(`@tesseract.js-data/${lang}`), '4.0.0_best_int', `${lang}.traineddata.gz`),
    join(out, 'lang', `${lang}.traineddata.gz`),
  ]),
];

let copied = 0;
for (const [from, to] of copies) {
  if (existsSync(to) && statSync(to).size === statSync(from).size) continue;
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied++;
}
console.log(`ocr-assets: ${copied} copied, ${copies.length - copied} up to date (public/tesseract)`);
