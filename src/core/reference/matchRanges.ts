import { foldText } from './foldText';

/** A stretch of a text, from `start` up to but not including `end`. */
export interface TextRange {
  start: number;
  end: number;
}

const NOT_FOUND = -1;

/** Where an already folded query appears in a text, in the text's own indices, without overlaps. */
export const matchRanges = (text: string, query: string): TextRange[] => {
  if (query === '') {
    return [];
  }

  const { folded, origins } = foldText(text);
  const ranges: TextRange[] = [];
  let hit = folded.indexOf(query);

  while (hit !== NOT_FOUND) {
    const hitEnd = hit + query.length;
    const start = origins[hit] ?? text.length;
    const end = origins[hitEnd] ?? text.length;

    ranges.push({ start, end });
    hit = folded.indexOf(query, hitEnd);
  }

  return ranges;
};
