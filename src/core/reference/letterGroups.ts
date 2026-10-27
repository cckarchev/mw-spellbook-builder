import type { GlossaryEntry } from "@/core/glossary/types";
import { foldText } from "./foldText";

/** The terms that start with one letter, in order. */
export interface LetterGroup {
  letter: string;
  entries: GlossaryEntry[];
}

const SORT_LOCALE = "en";
const SORT_OPTIONS: Intl.CollatorOptions = { sensitivity: "base" };

/** A sorted copy, ignoring case and accents. */
export const sortGlossary = (
  entries: readonly GlossaryEntry[],
): GlossaryEntry[] =>
  [...entries].sort((a, b) =>
    a.term.localeCompare(b.term, SORT_LOCALE, SORT_OPTIONS),
  );

/** The letter a term is filed under, without its accent: "V’Tar" is "V". */
export const letterOf = (term: string): string => {
  const first = foldText(term).folded.charAt(0);

  return first.toUpperCase();
};

/** Groups sorted entries by first letter, leaving out letters with no terms. */
export const groupByLetter = (
  sorted: readonly GlossaryEntry[],
): LetterGroup[] => {
  const groups: LetterGroup[] = [];

  for (const entry of sorted) {
    const letter = letterOf(entry.term);
    const last = groups.at(-1);

    if (last?.letter === letter) {
      last.entries.push(entry);
    } else {
      groups.push({ letter, entries: [entry] });
    }
  }

  return groups;
};
