import { type BookGroup, bookGroups } from '@/core/catalog/bookGroups';
import type { Book, Card, Mage } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';

// Plain lines with no markdown, so the text reads the same pasted into WhatsApp on a phone.

const headerLine = (mage: Mage, summary: BookSummary): string => {
  const over = summary.overBy > 0 ? ` (${summary.overBy} over)` : '';

  return `${mage.name} · ${summary.points}/${summary.budget} pts${over}`;
};

const groupBlock = (group: BookGroup): string => {
  const heading = `${group.type.toUpperCase()} (${group.copies})`;
  const entries = group.entries.map((entry) => `${entry.count}x ${entry.card.name}`);

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
  const blocks = bookGroups(book, mage, cardsById).map(groupBlock);

  return [headerLine(mage, summary), ...blocks, shareUrl].join('\n\n');
};
