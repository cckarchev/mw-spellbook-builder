import type { GlossaryEntry } from "@/core/glossary/types";
import { foldedOnce } from "./foldText";

export interface GlossarySearch {
  byName: GlossaryEntry[];
  byDefinition: GlossaryEntry[];
}

const folded = (text: string): string => foldedOnce(text).folded;

/**
 * Entries matching an already folded query: names that start with it, then
 * names that contain it, then the rest whose definition contains it. Each group
 * keeps the input order.
 */
export const searchGlossary = (
  entries: readonly GlossaryEntry[],
  query: string,
): GlossarySearch => {
  if (query === "") {
    return { byName: [], byDefinition: [] };
  }

  const startsWith: GlossaryEntry[] = [];
  const contains: GlossaryEntry[] = [];
  const byDefinition: GlossaryEntry[] = [];

  for (const entry of entries) {
    const term = folded(entry.term);

    if (term.startsWith(query)) {
      startsWith.push(entry);
    } else if (term.includes(query)) {
      contains.push(entry);
    } else if (folded(entry.definition).includes(query)) {
      byDefinition.push(entry);
    }
  }

  return { byName: [...startsWith, ...contains], byDefinition };
};
