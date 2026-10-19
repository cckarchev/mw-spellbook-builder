import type { Card } from '@/core/rules/types';

// Combining marks left after NFD decomposition, such as the accent in "É".
const COMBINING_MARKS = /[̀-ͯ]/g;
const WHITESPACE = /\s+/;

/** Lowercases and strips accents so "Éter" and "eter" compare equal. */
export const foldText = (text: string): string =>
  text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();

const queryWords = (query: string): string[] =>
  foldText(query)
    .split(WHITESPACE)
    .filter((word) => word !== '');

/** Whether every word of the query appears in the card's name or rules text. */
export const matchesQuery = (card: Card, query: string): boolean => {
  const words = queryWords(query);
  const searchable = foldText(`${card.name}\n${card.effect}`);

  return words.every((word) => searchable.includes(word));
};
