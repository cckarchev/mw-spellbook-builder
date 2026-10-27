export type BuilderTab = "cards" | "spellbook" | "stats";

/** The mage picker, at the root of the app. */
export const PICKER_PATH = "/";

/** The path segment that opens the Spellbook tab under a mage's path. */
export const SPELLBOOK_SEGMENT = "spellbook";

/** The path segment that opens the Stats tab under a mage's path. */
export const STATS_SEGMENT = "stats";

// Accents come apart into a letter plus a combining mark, which the next step
// drops.
const COMBINING_MARKS = /\p{M}/gu;
const APOSTROPHES = /['’]/g;
const NON_ALPHANUMERIC_RUNS = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-|-$/g;

/** A mage name as a URL segment, such as "anvil-throne-warlord". */
export const mageSlug = (name: string): string => {
  const decomposed = name.normalize("NFD");
  const withoutAccents = decomposed.replace(COMBINING_MARKS, "");
  const lowercase = withoutAccents.toLowerCase();
  const withoutApostrophes = lowercase.replace(APOSTROPHES, "");
  const dashed = withoutApostrophes.replace(NON_ALPHANUMERIC_RUNS, "-");

  return dashed.replace(EDGE_DASHES, "");
};

const TAB_SEGMENTS: Record<BuilderTab, string | null> = {
  cards: null,
  spellbook: SPELLBOOK_SEGMENT,
  stats: STATS_SEGMENT,
};

/**
 * Where the builder shows a mage's spellbook on a tab, such as
 * "/wizard/spellbook".
 */
export const builderPath = (mageName: string, tab: BuilderTab): string => {
  const magePath = `/${mageSlug(mageName)}`;
  const segment = TAB_SEGMENTS[tab];

  if (!segment) {
    return magePath;
  }

  return `${magePath}/${segment}`;
};
