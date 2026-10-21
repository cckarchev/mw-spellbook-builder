import { mageSlug } from '@/core/routing/builderPath';

/** The id of a term's entry in the Quick reference: "Armor +/- X" is "term-armor-x". */
export const termAnchorId = (term: string): string => `term-${mageSlug(term)}`;

/** The id of a letter's heading in the Quick reference: "A" is "letter-a". */
export const letterAnchorId = (letter: string): string => `letter-${letter.toLowerCase()}`;
