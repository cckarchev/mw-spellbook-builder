import { cardCost } from '@/core/rules/cardCost';
import type { Book, Card, CardType, Mage } from '@/core/rules/types';
import { groupByType } from './groupByType';

export interface BookEntry {
  card: Card;
  count: number;
  /** Points for all copies of the card. */
  points: number;
}

export interface BookGroup {
  type: CardType;
  entries: BookEntry[];
  /** Copies of every card in the group. */
  copies: number;
  /** Points for every card in the group. */
  points: number;
}

/** The book's cards grouped by type, with points per card and per group. Unknown cards are skipped. */
export const bookGroups = (
  book: Book,
  mage: Mage,
  cardsById: ReadonlyMap<string, Card>,
): BookGroup[] => {
  const entries: (BookEntry & { type: CardType; name: string })[] = [];

  for (const [cardId, count] of Object.entries(book.counts)) {
    const card = cardsById.get(cardId);

    if (card && count > 0) {
      const points = cardCost(card, mage, book.schoolChoice) * count;

      entries.push({ card, count, points, type: card.type, name: card.name });
    }
  }

  return groupByType(entries).map((group) => ({
    type: group.type,
    entries: group.items.map(({ card, count, points }) => ({ card, count, points })),
    copies: group.items.reduce((sum, entry) => sum + entry.count, 0),
    points: group.items.reduce((sum, entry) => sum + entry.points, 0),
  }));
};
