export type BuilderTab = 'cards' | 'spellbook';

/** The mage picker, at the root of the app. */
export const PICKER_PATH = '/';

/** The path segment that opens the Spellbook tab under a mage's path. */
export const SPELLBOOK_SEGMENT = 'spellbook';

// Accents come apart into a letter plus a combining mark, which the next step drops.
const COMBINING_MARKS = /\p{M}/gu;
const APOSTROPHES = /['’]/g;
const NON_ALPHANUMERIC_RUNS = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-|-$/g;

/** A mage name as a URL segment, such as "anvil-throne-warlord". */
export const mageSlug = (name: string): string => {
  const decomposed = name.normalize('NFD');
  const withoutAccents = decomposed.replace(COMBINING_MARKS, '');
  const lowercase = withoutAccents.toLowerCase();
  const withoutApostrophes = lowercase.replace(APOSTROPHES, '');
  const dashed = withoutApostrophes.replace(NON_ALPHANUMERIC_RUNS, '-');

  return dashed.replace(EDGE_DASHES, '');
};

/** Where the builder shows a mage's spellbook on a tab, such as "/wizard/spellbook". */
export const builderPath = (mageName: string, tab: BuilderTab): string => {
  const magePath = `/${mageSlug(mageName)}`;

  if (tab === 'spellbook') {
    return `${magePath}/${SPELLBOOK_SEGMENT}`;
  }

  return magePath;
};
