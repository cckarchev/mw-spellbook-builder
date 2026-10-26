import type { TextSegment } from "@/core/glossary/findTerms";
import type { GlossaryEntry } from "@/core/glossary/types";

/**
 * Keeps a link only on the first mention of each term, and never on the entry's
 * own term, so a definition does not turn into a field of links. Plain text
 * next to plain text merges.
 */
export const linkOnce = (
  segments: readonly TextSegment[],
  own: GlossaryEntry,
): TextSegment[] => {
  const linked = new Set<GlossaryEntry>([own]);
  const result: TextSegment[] = [];

  for (const segment of segments) {
    const keepsLink = segment.entry !== null && !linked.has(segment.entry);
    const entry = keepsLink ? segment.entry : null;
    const last = result.at(-1);

    if (entry) {
      linked.add(entry);
    }

    if (entry === null && last && last.entry === null) {
      last.text += segment.text;
      continue;
    }

    result.push({ text: segment.text, entry });
  }

  return result;
};
