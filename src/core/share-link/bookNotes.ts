import type { Book, Card, Mage } from '@/core/rules/types';
import type { BookIssue, BookSummary } from '@/core/rules/validateBook';

const plural = (count: number, singular: string, pluralForm: string): string =>
  `${count} ${count === 1 ? singular : pluralForm}`;

/** The note shown next to the share actions while the book is not legal, or null. */
export const shareNote = (summary: BookSummary): string | null => {
  const parts: string[] = [];

  if (summary.overBy > 0) {
    parts.push(`${plural(summary.overBy, 'point', 'points')} over`);
  }

  if (summary.issues.length > 0) {
    parts.push(plural(summary.issues.length, 'problem', 'problems'));
  }

  if (parts.length === 0) {
    return null;
  }

  return `Not a legal book yet: ${parts.join(', ')}`;
};

const unknownCardsLine = (count: number): string => {
  const cards = plural(count, 'card', 'cards');
  const verb = count === 1 ? 'is' : 'are';
  const leftOut = count === 1 ? 'was left out' : 'were left out';

  return `${cards} in the link ${verb} not in the catalog and ${leftOut}`;
};

const issueLine = (
  issue: BookIssue,
  mage: Mage,
  counts: Book['counts'],
  cardsById: ReadonlyMap<string, Card>,
): string | null => {
  switch (issue.kind) {
    case 'tooManyCopies': {
      const name = cardsById.get(issue.cardId)?.name ?? issue.cardId;

      return `${name}: ${counts[issue.cardId]} copies, max ${issue.max}`;
    }
    case 'illegalCard': {
      const name = cardsById.get(issue.cardId)?.name ?? issue.cardId;

      return `${mage.name} cannot use ${name}`;
    }
    case 'missingSchoolChoice': {
      return `${mage.name} needs a school: choose one in the mage picker`;
    }
    default: {
      // Unknown cards are reported from the link's unknown codes instead.
      return null;
    }
  }
};

/** One line per problem in a book opened from a link, for the player to fix. */
export const incomingProblems = (
  unknownCodes: string[],
  issues: BookIssue[],
  mage: Mage,
  counts: Book['counts'],
  cardsById: ReadonlyMap<string, Card>,
): string[] => {
  const lines: string[] = [];

  if (unknownCodes.length > 0) {
    lines.push(unknownCardsLine(unknownCodes.length));
  }

  for (const issue of issues) {
    const line = issueLine(issue, mage, counts, cardsById);

    if (line !== null) {
      lines.push(line);
    }
  }

  return lines;
};
