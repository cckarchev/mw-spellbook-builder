import { mageSlug } from '@/core/routing/builderPath';
import { REFERENCE_PATH } from '@/core/routing/referencePath';

const HASH_MARK = '#';

/** The id of a term's entry in the Quick reference: "Armor +/- X" is "term-armor-x". */
export const termAnchorId = (term: string): string => `term-${mageSlug(term)}`;

/** The id of a letter's heading in the Quick reference: "A" is "letter-a". */
export const letterAnchorId = (letter: string): string => `letter-${letter.toLowerCase()}`;

/** Where a term sits in the app: "Destroyed" is "/reference#term-destroyed". */
export const termPath = (term: string): string =>
  `${REFERENCE_PATH}${HASH_MARK}${termAnchorId(term)}`;

/** The link to share a term, on this app's origin, such as window.location.origin. */
export const termLink = (origin: string, term: string): string => `${origin}${termPath(term)}`;

/** The term an address hash such as "#term-destroyed" points at, or null for none. */
export const termOfHash = (hash: string, terms: readonly string[]): string | null => {
  const anchorId = hash.startsWith(HASH_MARK) ? hash.slice(HASH_MARK.length) : hash;

  if (anchorId === '') {
    return null;
  }

  return terms.find((term) => termAnchorId(term) === anchorId) ?? null;
};
