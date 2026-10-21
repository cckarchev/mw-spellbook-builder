import { splitByTerms, type TextSegment } from '@/core/glossary/findTerms';
import type { GlossaryEntry } from '@/core/glossary/types';
import { linkOnce } from '@/core/reference/linkOnce';
import { glossaryIndex } from '@/data/glossary';

const known = new Map<GlossaryEntry, TextSegment[]>();

/**
 * A definition split at the terms it links, worked out once per entry: switching between the
 * full list and search results mounts every entry again.
 */
export const linkedSegments = (entry: GlossaryEntry): TextSegment[] => {
  const cached = known.get(entry);

  if (cached) {
    return cached;
  }

  const segments = linkOnce(splitByTerms(entry.definition, glossaryIndex), entry);

  known.set(entry, segments);

  return segments;
};
