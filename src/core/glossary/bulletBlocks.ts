import type { TextRange } from '@/core/reference/matchRanges';

const BULLET = '•';
const LEADING_SPACE = /^\s*/;
const TRAILING_SPACE = /\s*$/;

/** Where a definition's intro and its bulleted items sit in its text. */
export interface BulletBlocks {
  intro: TextRange;
  items: TextRange[];
}

/** The range of a piece of text, starting at `start`, without the spaces around it. */
const trimmedRange = (piece: string, start: number): TextRange => {
  const leading = piece.match(LEADING_SPACE)?.[0].length ?? 0;
  const trailing = piece.match(TRAILING_SPACE)?.[0].length ?? 0;
  const end = Math.max(start + leading, start + piece.length - trailing);

  return { start: start + leading, end };
};

/**
 * Splits a definition at its "•" bullets, which the Codex runs inline: the text before the first
 * one is the intro, and each one after starts an item. Empty items are dropped.
 */
export const bulletBlocks = (text: string): BulletBlocks => {
  const ranges: TextRange[] = [];
  let start = 0;

  for (const piece of text.split(BULLET)) {
    ranges.push(trimmedRange(piece, start));
    start += piece.length + BULLET.length;
  }

  const [intro = { start: 0, end: 0 }, ...items] = ranges;
  const filledItems = items.filter((item) => item.end > item.start);

  return { intro, items: filledItems };
};
