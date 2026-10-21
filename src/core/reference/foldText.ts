/** A text folded for search, with the original index of each folded character. */
export interface FoldedText {
  folded: string;
  /** `origins[i]` is where folded character `i` came from; one last item holds the length. */
  origins: number[];
}

const COMBINING_MARKS = /\p{M}/gu;
const CURLY_APOSTROPHE = /’/g;
const STRAIGHT_APOSTROPHE = "'";

const foldCharacter = (character: string): string => {
  const lowercase = character.toLowerCase();
  const decomposed = lowercase.normalize('NFD');
  const withoutAccents = decomposed.replace(COMBINING_MARKS, '');

  return withoutAccents.replace(CURLY_APOSTROPHE, STRAIGHT_APOSTROPHE);
};

/** Lowercases, drops accents and reads `’` as `'`, one character at a time. */
export const foldText = (text: string): FoldedText => {
  let folded = '';
  const origins: number[] = [];
  let position = 0;

  for (const character of text) {
    const foldedCharacter = foldCharacter(character);

    const characterOrigins = new Array<number>(foldedCharacter.length).fill(position);

    folded += foldedCharacter;
    origins.push(...characterOrigins);
    position += character.length;
  }

  origins.push(text.length);

  return { folded, origins };
};

/** The query as search compares it; an empty string means no query. */
export const foldQuery = (query: string): string => {
  const trimmed = query.trim();

  return foldText(trimmed).folded;
};
