import { plural } from "@/core/text/plural";
import { cardCost } from "./cardCost";
import { maxCopies } from "./copyLimit";
import { isLegalFor } from "./legality";
import type { Card, Mage, Spellbook } from "./types";

export type SpellbookIssue =
  /** A card id in the spellbook that the catalog no longer has. */
  | { kind: "unknownCard"; cardId: string }
  | { kind: "illegalCard"; cardId: string }
  | { kind: "tooManyCopies"; cardId: string; max: number };

export interface SpellbookSummary {
  points: number;
  budget: number;
  /**
   * Points above the budget, 0 when within it. Over budget is allowed while
   * building.
   */
  overBy: number;
  cardCount: number;
  issues: SpellbookIssue[];
}

const entriesInSpellbook = (spellbook: Spellbook): [string, number][] =>
  Object.entries(spellbook.counts).filter(([, count]) => count > 0);

const issuesForCard = (
  card: Card,
  count: number,
  mage: Mage,
): SpellbookIssue[] => {
  const issues: SpellbookIssue[] = [];
  const max = maxCopies(card);

  if (!isLegalFor(card, mage)) {
    issues.push({ kind: "illegalCard", cardId: card.id });
  }

  if (count > max) {
    issues.push({ kind: "tooManyCopies", cardId: card.id, max });
  }

  return issues;
};

/** Points, card count and every rule the spellbook breaks, for this mage. */
export const summarizeSpellbook = (
  spellbook: Spellbook,
  mage: Mage,
  cardsById: ReadonlyMap<string, Card>,
): SpellbookSummary => {
  const issues: SpellbookIssue[] = [];
  let points = 0;
  let cardCount = 0;

  for (const [cardId, count] of entriesInSpellbook(spellbook)) {
    const card = cardsById.get(cardId);

    if (!card) {
      issues.push({ kind: "unknownCard", cardId });
      continue;
    }

    points += cardCost(card, mage) * count;
    cardCount += count;
    issues.push(...issuesForCard(card, count, mage));
  }

  const overBy = Math.max(0, points - mage.budget);

  return { points, budget: mage.budget, overBy, cardCount, issues };
};

/**
 * Why the + control for a card is blocked, or null when it is not. Going over
 * budget does not block it.
 */
export const addCopyBlockedReason = (
  spellbook: Spellbook,
  card: Card,
  mage: Mage,
): string | null => {
  const count = spellbook.counts[card.id] ?? 0;
  const max = maxCopies(card);

  if (!isLegalFor(card, mage)) {
    return `${mage.name} cannot use this card`;
  }

  if (count >= max) {
    return `Max ${plural(max, "copy", "copies")}`;
  }

  return null;
};

/** Whether the + control for a card is enabled. */
export const canAddCopy = (
  spellbook: Spellbook,
  card: Card,
  mage: Mage,
): boolean => addCopyBlockedReason(spellbook, card, mage) === null;
