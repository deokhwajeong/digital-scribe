import type { Locale } from '@/lib/i18n/config';

export interface TextContent {
  id: string;
  title: string;
  author: string;
  content: string;
  language: Locale;
}

// Original practice passages written for Digital Scribe. Free to reuse.
export const texts: TextContent[] = [
  {
    id: 'en-morning-market',
    title: 'The Morning Market',
    author: 'Digital Scribe original',
    language: 'en',
    content:
      'Before the sun clears the rooftops, the market is already awake. A baker stacks warm loaves beside a crate of green pears, and a florist trims stems with quick, patient hands. Nobody hurries, yet everything is ready by seven. Small routines, repeated well, become a kind of quiet skill.',
  },
  {
    id: 'en-letters-in-the-attic',
    title: 'Letters in the Attic',
    author: 'Digital Scribe original',
    language: 'en',
    content:
      'The box was lighter than she expected. Inside were forty letters tied with blue thread, each one dated and signed with a single initial. She read the first slowly, then the second faster, until the afternoon light turned gold and the attic smelled of dust and cedar.',
  },
  {
    id: 'en-practice-notes',
    title: 'Notes on Practice',
    author: 'Digital Scribe original',
    language: 'en',
    content:
      'Copying good sentences by hand is an old way to learn how writing works. You notice where a comma breathes, how a short line lands after a long one, and which verbs carry the weight. Speed comes later. Accuracy first, rhythm second, and the rest follows.',
  },
  {
    id: 'ko-autumn-library',
    title: '가을 도서관',
    author: 'Digital Scribe 창작',
    language: 'ko',
    content:
      '창밖으로 은행잎이 천천히 떨어진다. 도서관 이층 창가 자리에는 오늘도 같은 사람이 앉아 공책에 무언가를 옮겨 적고 있다. 서두르지 않는 손끝에서 문장이 한 줄씩 자라난다.',
  },
  {
    id: 'ko-first-snow',
    title: '첫눈 오는 저녁',
    author: 'Digital Scribe 창작',
    language: 'ko',
    content:
      '퇴근길 버스 정류장에 첫눈이 내렸다. 사람들은 잠시 휴대폰을 내려놓고 하늘을 올려다보았다. 누군가 작게 웃었고, 그 웃음이 옆 사람에게로 번져 갔다.',
  },
  {
    id: 'ko-daily-practice',
    title: '매일의 연습',
    author: 'Digital Scribe 창작',
    language: 'ko',
    content:
      '좋은 문장을 따라 쓰다 보면 글의 호흡이 보이기 시작한다. 쉼표가 어디에서 숨을 고르는지, 짧은 문장이 왜 힘을 가지는지 손이 먼저 기억한다. 속도는 그다음 문제다.',
  },
  {
    id: 'ja-station-rain',
    title: '雨の駅',
    author: 'Digital Scribe オリジナル',
    language: 'ja',
    content:
      '小さな駅のホームに、夕方の雨が静かに降っている。傘を持たない学生が、屋根の下で文庫本を開いた。電車が来るまでの五分間は、彼女だけの時間だ。',
  },
  {
    id: 'ja-morning-tea',
    title: '朝のお茶',
    author: 'Digital Scribe オリジナル',
    language: 'ja',
    content:
      '祖母は毎朝、同じ急須でお茶をいれる。湯をそそぐ音、湯気の向こうの庭、そして短いあいさつ。特別なことは何もないが、その繰り返しが一日を形づくっている。',
  },
  {
    id: 'ja-copying-practice',
    title: '書き写しのすすめ',
    author: 'Digital Scribe オリジナル',
    language: 'ja',
    content:
      'よい文章を書き写すと、言葉のリズムが体に残る。句読点の位置や、短い文が続くときの心地よさに気づくだろう。まずは正確に、速さはあとからついてくる。',
  },
];

export const textsFor = (language: Locale): TextContent[] => {
  const matches = texts.filter((text) => text.language === language);
  return matches.length > 0 ? matches : texts.filter((text) => text.language === 'en');
};
