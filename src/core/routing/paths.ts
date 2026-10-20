export type BuilderTab = 'cards' | 'book';

/** The mage picker, at the root of the app. */
export const PICKER_PATH = '/';

/** The path segment that opens the Book tab under a mage's path. */
export const BOOK_SEGMENT = 'book';

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

/** Where the builder shows a mage's book on a tab, such as "/wizard/book". */
export const builderPath = (mageName: string, tab: BuilderTab): string => {
  const magePath = `/${mageSlug(mageName)}`;

  if (tab === 'book') {
    return `${magePath}/${BOOK_SEGMENT}`;
  }

  return magePath;
};

/** Where a book lives: its mage's builder, or the mage picker when it has no mage. */
export const bookPath = (mage: { name: string } | undefined, tab: BuilderTab): string => {
  if (!mage) {
    return PICKER_PATH;
  }

  return builderPath(mage.name, tab);
};

const PATH_SEPARATOR = '/';

const pathSegments = (pathname: string): string[] =>
  pathname.split(PATH_SEPARATOR).filter((segment) => segment !== '');

/** The mage slug a path starts with, such as "wizard" for "/wizard/book", or null on the picker. */
export const slugFromPath = (pathname: string): string | null => {
  const [firstSegment] = pathSegments(pathname);

  return firstSegment ?? null;
};

/** The builder tab a path opens: Book under its segment, Cards otherwise. */
export const tabFromPath = (pathname: string): BuilderTab => {
  const [, tabSegment] = pathSegments(pathname);

  return tabSegment === BOOK_SEGMENT ? 'book' : 'cards';
};
