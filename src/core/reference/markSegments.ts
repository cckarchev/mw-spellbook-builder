import type { TextSegment } from "@/core/glossary/findTerms";
import type { GlossaryEntry } from "@/core/glossary/types";
import type { TextRange } from "./matchRanges";

/** A piece of a segment, highlighted or not. */
export interface MarkedPart {
  text: string;
  marked: boolean;
}

/** A segment of text split where search highlights start and end. */
export interface MarkedSegment {
  entry: GlossaryEntry | null;
  parts: MarkedPart[];
}

const isMarked = (position: number, ranges: readonly TextRange[]): boolean =>
  ranges.some((range) => range.start <= position && position < range.end);

/**
 * The positions inside `[start, end)` where a range starts or ends, plus both
 * edges.
 */
const cutsWithin = (
  start: number,
  end: number,
  ranges: readonly TextRange[],
): number[] => {
  const edges = ranges.flatMap((range) => [range.start, range.end]);
  const inside = edges.filter((edge) => edge > start && edge < end);

  return [...new Set([start, ...inside, end])].sort((a, b) => a - b);
};

/**
 * Splits each segment at highlight edges, so a highlight can fall inside or
 * across a term.
 */
export const markSegments = (
  segments: readonly TextSegment[],
  ranges: readonly TextRange[],
): MarkedSegment[] => {
  let offset = 0;

  return segments.map((segment) => {
    const start = offset;
    const end = start + segment.text.length;
    const cuts = cutsWithin(start, end, ranges);
    const parts = cuts.slice(1).map((cut, index) => {
      const from = cuts[index] ?? start;

      return {
        text: segment.text.slice(from - start, cut - start),
        marked: isMarked(from, ranges),
      };
    });

    offset = end;

    return { entry: segment.entry, parts };
  });
};
