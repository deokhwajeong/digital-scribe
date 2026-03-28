import type { Locale } from '@/lib/i18n/config';

export interface TextContent {
  id: string;
  title: string;
  author: string;
  content: string;
  language: Locale;
}

export const texts: TextContent[] = [
  {
    id: 'pride-and-prejudice-en',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    language: 'en',
    content: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.`,
  },
  {
    id: 'korean-sample',
    title: '한국어 샘플',
    author: '테스트',
    language: 'ko',
    content: `좋은 아침입니다. 오늘은 필사 연습을 통해 작문 실력을 향상시키는 훌륭한 날입니다. 꾸준한 연습이 실력 향상의 핵심입니다. 매일 조금씩 연습하면 놀라운 발전을 경험할 수 있습니다.`,
  },
  {
    id: 'japanese-sample',
    title: '日本語サンプル',
    author: 'テスト',
    language: 'ja',
    content: `おはようございます。今日はタイピング練習を通して文章力を高めるのにぴったりな日です。継続は上達への近道です。毎日少しずつ続けることで、大きな成長を実感できます。`,
  },
];
