import type { Card } from "@/core/rules/types";
import type { CountRow } from "./types";

export interface CardCopies {
  card: Card;
  count: number;
}

/**
 * Copies per label, where a card may carry several labels and counts once in
 * each.
 */
export const tally = (
  copies: CardCopies[],
  labelsOf: (card: Card) => string[],
): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const { card, count } of copies) {
    const labels = new Set(labelsOf(card));

    for (const label of labels) {
      counts.set(label, (counts.get(label) ?? 0) + count);
    }
  }

  return counts;
};

const byCountThenLabel = (a: CountRow, b: CountRow): number =>
  b.count - a.count || a.label.localeCompare(b.label);

/** Non-zero rows, highest count first, then by label. */
export const rowsByCount = (counts: Map<string, number>): CountRow[] =>
  [...counts]
    .map(([label, count]) => ({ label, count }))
    .filter((row) => row.count > 0)
    .sort(byCountThenLabel);

/** Non-zero rows in the given label order. */
export const rowsInOrder = (
  counts: Map<string, number>,
  order: string[],
): CountRow[] =>
  order
    .map((label) => ({ label, count: counts.get(label) ?? 0 }))
    .filter((row) => row.count > 0);
