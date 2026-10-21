import { groupByLetter, sortGlossary } from "@/core/reference/letterGroups";
import { glossary } from "@/data/glossary";

/** Every glossary term in alphabetical order, ignoring case and accents. */
export const sortedGlossary = sortGlossary(glossary);

/** The sorted terms under their first letters. */
export const letterGroups = groupByLetter(sortedGlossary);
