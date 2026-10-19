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
    default: {
      // Unknown cards are reported from the link's unknown codes instead.
      return null;
    }
  }
};

/** One line per problem of the book being built, for the player to fix. */
export const bookProblems = (
  issues: BookIssue[],
  mage: Mage,
  counts: Book['counts'],
  cardsById: ReadonlyMap<string, Card>,
): string[] => {
  const lines: string[] = [];

  for (const issue of issues) {
    const line = issueLine(issue, mage, counts, cardsById);

    if (line !== null) {
      lines.push(line);
    }
  }

  return lines;
};

/** One line per problem in a book opened from a link, for the player to fix. */
export const incomingProblems = (
  unknownCodes: string[],
  issues: BookIssue[],
  mage: Mage,
  counts: Book['counts'],
  cardsById: ReadonlyMap<string, Card>,
): string[] => {
  const unknownLines = unknownCodes.length > 0 ? [unknownCardsLine(unknownCodes.length)] : [];

  return [...unknownLines, ...bookProblems(issues, mage, counts, cardsById)];
};

const NOTE_SEPARATOR = '. ';

const cardNote = (issue: BookIssue, mage: Mage): { cardId: string; note: string } | null => {
  switch (issue.kind) {
    case 'tooManyCopies': {
      return { cardId: issue.cardId, note: `Too many copies: max ${issue.max}` };
    }
    case 'illegalCard': {
      return { cardId: issue.cardId, note: `${mage.name} cannot use this card` };
    }
    default: {
      return null;
    }
  }
};

/** A short note for each card row that has a problem, keyed by card id. */
export const cardProblems = (issues: BookIssue[], mage: Mage): Map<string, string> => {
  const notes = new Map<string, string>();

  for (const issue of issues) {
    const entry = cardNote(issue, mage);

    if (!entry) {
      continue;
    }

    const previous = notes.get(entry.cardId);
    const note = previous === undefined ? entry.note : `${previous}${NOTE_SEPARATOR}${entry.note}`;

    notes.set(entry.cardId, note);
  }

  return notes;
};

const CHOOSE_MAGE = 'Choose one to keep building.';

/** The problems of a link that opens without a usable mage. */
export const noMageProblems = (unknownMage: string | null, unknownCodes: string[]): string[] => {
  const mageLine =
    unknownMage === null
      ? `The link names no mage. ${CHOOSE_MAGE}`
      : `The mage in this link (${unknownMage}) is not in the catalog. ${CHOOSE_MAGE}`;
  const lines = [mageLine];

  if (unknownCodes.length > 0) {
    lines.push(unknownCardsLine(unknownCodes.length));
  }

  return lines;
};
