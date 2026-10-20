export type BuilderTab = 'cards' | 'book';

/** The path segment that opens the Book tab under a mage's path. */
export const BOOK_SEGMENT = 'book';

// Accents come apart into a letter plus a combining mark, which the next step drops.
const COMBINING_MARKS = /\p{M}/gu;
const APOSTROPHES = /['’]/g;
const NON_ALPHANUMERIC_RUNS = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-|-$/g;

/** A mage name as a URL segment, such as "anvil-throne-warlord". */
export const mageSlug = (name: string): string => {
  const plain = name.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
  const withoutApostrophes = plain.replace(APOSTROPHES, '');

  return withoutApostrophes.replace(NON_ALPHANUMERIC_RUNS, '-').replace(EDGE_DASHES, '');
};

/** Where the builder shows a mage's book on a tab, such as "/wizard/book". */
export const builderPath = (mageName: string, tab: BuilderTab): string => {
  const magePath = `/${mageSlug(mageName)}`;

  if (tab === 'book') {
    return `${magePath}/${BOOK_SEGMENT}`;
  }

  return magePath;
};
