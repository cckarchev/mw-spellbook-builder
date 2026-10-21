/** A text folded for search, with the original index of each folded character. */
export interface FoldedText {
  folded: string;
  /** `origins[i]` is where folded character `i` came from; one last item holds the length. */
  origins: number[];
}

const COMBINING_MARKS = /\p{M}/gu;
const CURLY_APOSTROPHE = /’/g;
const STRAIGHT_APOSTROPHE = "'";
// Plain ASCII only needs lowercasing, which keeps the common case off the slower normalize.
const LAST_ASCII = 0x7f;
// One letter matches nearly every term, so search waits for a second.
const MIN_QUERY_LENGTH = 2;

const isAscii = (character: string): boolean =>
  (character.codePointAt(0) ?? 0) <= LAST_ASCII;

const foldCharacter = (character: string): string => {
  const lowercase = character.toLowerCase();

  if (isAscii(character)) {
    return lowercase;
  }

  const decomposed = lowercase.normalize("NFD");
  const withoutAccents = decomposed.replace(COMBINING_MARKS, "");

  return withoutAccents.replace(CURLY_APOSTROPHE, STRAIGHT_APOSTROPHE);
};

/** Lowercases, drops accents and reads `’` as `'`, one character at a time. */
export const foldText = (text: string): FoldedText => {
  let folded = "";
  const origins: number[] = [];
  let position = 0;

  for (const character of text) {
    const foldedCharacter = foldCharacter(character);

    const characterOrigins = new Array<number>(foldedCharacter.length).fill(
      position,
    );

    folded += foldedCharacter;
    origins.push(...characterOrigins);

    position += character.length;
  }

  origins.push(text.length);

  return { folded, origins };
};

const foldedTexts = new Map<string, FoldedText>();

/**
 * foldText for the glossary's own texts, which never change: each is folded on its first search
 * and kept, so later keystrokes only compare.
 */
export const foldedOnce = (text: string): FoldedText => {
  const known = foldedTexts.get(text);

  if (known) {
    return known;
  }

  const folded = foldText(text);

  foldedTexts.set(text, folded);

  return folded;
};

/** The query as search compares it; an empty string means no query yet. */
export const foldQuery = (query: string): string => {
  const trimmed = query.trim();
  const { folded } = foldText(trimmed);

  if (folded.length < MIN_QUERY_LENGTH) {
    return "";
  }

  return folded;
};
