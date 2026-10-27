import type { Card } from "@/core/rules/types";

// Combining marks left after NFD decomposition, such as the accent in "É".
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const WHITESPACE = /\s+/;
const PART_SEPARATOR = "\n";

/** Lowercases and strips accents so "Éter" and "eter" compare equal. */
const foldText = (text: string): string =>
  text.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase();

const queryWords = (query: string): string[] =>
  foldText(query)
    .split(WHITESPACE)
    .filter((word) => word !== "");

/** Everything printed on the card that a player might search for. */
const searchableText = (card: Card): string =>
  [
    card.name,
    card.effect,
    card.attackBar,
    card.abilityBar,
    ...card.traits,
    ...card.subtypes,
  ].join(PART_SEPARATOR);

/**
 * Whether every word of the query appears somewhere in the text. An empty query
 * matches.
 */
export const matchesText = (text: string, query: string): boolean => {
  const words = queryWords(query);
  const searchable = foldText(text);

  return words.every((word) => searchable.includes(word));
};

/**
 * Whether every word of the query appears somewhere in the card's printed text.
 */
export const matchesQuery = (card: Card, query: string): boolean =>
  matchesText(searchableText(card), query);
