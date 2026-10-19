import { groupByType } from '@/core/catalog/groupByType';
import type { Book, Card, Mage } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';

// Plain lines with no markdown, so the text reads the same pasted into WhatsApp on a phone.

interface BookLine {
  type: Card['type'];
  name: string;
  count: number;
}

const headerLine = (book: Book, mage: Mage, summary: BookSummary): string => {
  const choice = book.schoolChoice === null ? '' : ` (${book.schoolChoice})`;
  const over = summary.overBy > 0 ? ` (${summary.overBy} over)` : '';

  return `${mage.name}${choice} · ${summary.points}/${summary.budget} pts${over}`;
};

const bookLines = (book: Book, cardsById: ReadonlyMap<string, Card>): BookLine[] => {
  const lines: BookLine[] = [];

  for (const [cardId, count] of Object.entries(book.counts)) {
    const card = cardsById.get(cardId);

    if (card && count > 0) {
      lines.push({ type: card.type, name: card.name, count });
    }
  }

  return lines;
};

const groupBlock = (type: Card['type'], items: BookLine[]): string => {
  const copies = items.reduce((sum, item) => sum + item.count, 0);
  const heading = `${type.toUpperCase()} (${copies})`;
  const entries = items.map((item) => `${item.count}x ${item.name}`);

  return [heading, ...entries].join('\n');
};

/** The book as plain text for pasting into a chat, ending with its share link. */
export const bookText = (
  book: Book,
  mage: Mage,
  summary: BookSummary,
  cardsById: ReadonlyMap<string, Card>,
  shareUrl: string,
): string => {
  const groups = groupByType(bookLines(book, cardsById));
  const blocks = groups.map((group) => groupBlock(group.type, group.items));

  return [headerLine(book, mage, summary), ...blocks, shareUrl].join('\n\n');
};
