import { withBasePath } from '@/lib/base-path';

/**
 * A bundled "book page" image plus the text an OCR pass produces for it.
 * The demo build uses the precomputed result so the OCR flow works without
 * downloading Tesseract language data. The passage is original.
 */
export const OCR_SAMPLE = {
  imageSrc: withBasePath('/samples/ocr-sample-page.png'),
  width: 900,
  height: 1200,
  language: 'eng' as const,
  title: 'Chapter Three: The Lighthouse Keeper',
  text: [
    'The lighthouse keeper kept two notebooks. In the first he wrote the weather: wind from the west, a low gray sky, rain by noon.',
    'In the second he wrote everything else. The color of the water at dawn, the name of a fishing boat that waved, the shape of a cloud that looked like a sleeping dog.',
    'Years later, when visitors asked which notebook mattered more, he only smiled and handed them both.',
  ].join(' '),
};
