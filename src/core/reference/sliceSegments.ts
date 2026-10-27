import type { MarkedSegment } from "./markSegments";
import type { TextRange } from "./matchRanges";

/**
 * The part of each segment inside a range of the whole text, leaving out what
 * falls outside.
 */
export const sliceSegments = (
  segments: readonly MarkedSegment[],
  range: TextRange,
): MarkedSegment[] => {
  const sliced: MarkedSegment[] = [];
  let offset = 0;

  for (const segment of segments) {
    const parts = [];

    for (const part of segment.parts) {
      const partStart = offset;
      const partEnd = partStart + part.text.length;
      const from = Math.max(partStart, range.start);
      const to = Math.min(partEnd, range.end);

      offset = partEnd;

      if (from < to) {
        parts.push({
          text: part.text.slice(from - partStart, to - partStart),
          marked: part.marked,
        });
      }
    }

    if (parts.length > 0) {
      sliced.push({ entry: segment.entry, parts });
    }
  }

  return sliced;
};
