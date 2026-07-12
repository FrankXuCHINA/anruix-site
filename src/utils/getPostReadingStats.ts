import { countContentWords } from "./countContentWords";

const CHINESE_READING_SPEED = 300;

export function getPostReadingStats(markdown: string) {
  const wordCount = countContentWords(markdown);
  const readingMinutes = Math.max(
    1,
    Math.ceil(wordCount / CHINESE_READING_SPEED)
  );

  return { wordCount, readingMinutes };
}
