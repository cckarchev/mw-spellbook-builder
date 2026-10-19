import { cardCost } from './cardCost';
import { maxCopies } from './copyLimit';
import { isLegalFor } from './legality';
import type { Book, Card, Mage, School } from './types';

export type BookIssue =
  | { kind: 'unknownCard'; code: string }
  | { kind: 'illegalCard'; cardId: string }
  | { kind: 'tooManyCopies'; cardId: string; max: number }
  | { kind: 'missingSchoolChoice' };

export interface BookSummary {
  points: number;
  budget: number;
  /** Points above the budget, 0 when within it. Over budget is allowed while building. */
  overBy: number;
  cardCount: number;
  issues: BookIssue[];
}

const entriesInBook = (book: Book): [string, number][] =>
  Object.entries(book.counts).filter(([, count]) => count > 0);

const issuesForCard = (card: Card, count: number, book: Book, mage: Mage): BookIssue[] => {
  const issues: BookIssue[] = [];
  const max = maxCopies(card);

  if (!isLegalFor(card, mage, book.schoolChoice)) {
    issues.push({ kind: 'illegalCard', cardId: card.id });
  }

  if (count > max) {
    issues.push({ kind: 'tooManyCopies', cardId: card.id, max });
  }

  return issues;
};

/** Points, card count and every rule the book breaks, for this mage. */
export const summarizeBook = (
  book: Book,
  mage: Mage,
  cardsById: ReadonlyMap<string, Card>,
): BookSummary => {
  const issues: BookIssue[] = [];
  const needsSchoolChoice = mage.training.schoolChoice.length > 0 && book.schoolChoice === null;
  let points = 0;
  let cardCount = 0;

  if (needsSchoolChoice) {
    issues.push({ kind: 'missingSchoolChoice' });
  }

  for (const [cardId, count] of entriesInBook(book)) {
    const card = cardsById.get(cardId);

    if (!card) {
      issues.push({ kind: 'unknownCard', code: cardId });
      continue;
    }

    points += cardCost(card, mage, book.schoolChoice) * count;
    cardCount += count;
    issues.push(...issuesForCard(card, count, book, mage));
  }

  const overBy = Math.max(0, points - mage.budget);

  return { points, budget: mage.budget, overBy, cardCount, issues };
};

/** Why the + control for a card is blocked, or null when it is not. Going over budget does not block it. */
export const addCopyBlockedReason = (book: Book, card: Card, mage: Mage): string | null => {
  const count = book.counts[card.id] ?? 0;
  const max = maxCopies(card);

  if (!isLegalFor(card, mage, book.schoolChoice)) {
    return `${mage.name} cannot use this card`;
  }

  if (count >= max) {
    const noun = max === 1 ? 'copy' : 'copies';

    return `Max ${max} ${noun}`;
  }

  return null;
};

/** Whether the + control for a card is enabled. */
export const canAddCopy = (book: Book, card: Card, mage: Mage): boolean =>
  addCopyBlockedReason(book, card, mage) === null;

/** Cards in the book that the mage (with this school choice) cannot use. */
export const cardsIllegalFor = (
  book: Book,
  mage: Mage,
  schoolChoice: School | null,
  cardsById: ReadonlyMap<string, Card>,
): Card[] => {
  const cardsInBook = entriesInBook(book)
    .map(([cardId]) => cardsById.get(cardId))
    .filter((card): card is Card => card !== undefined);

  return cardsInBook.filter((card) => !isLegalFor(card, mage, schoolChoice));
};
