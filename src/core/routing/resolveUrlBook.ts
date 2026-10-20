import { hasCards, mageSwitchKind, sameBook } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';

/** A share link's content: its book, plus whatever else the caller decoded with it. */
interface LinkContent {
  book: Book;
}

interface UrlBookInput<Link extends LinkContent> {
  /** The book in progress. */
  current: Book;
  /** The mage the path names, or null on a page with no mage, such as the picker. */
  routeMageId: string | null;
  /** The share link (?b=), "unreadable" when it could not be decoded, or null. */
  link: Link | 'unreadable' | null;
}

/** What the app does with the book when the URL changes. */
export type UrlBookAction<Link extends LinkContent> =
  | { kind: 'keep' }
  | { kind: 'unreadableLink' }
  | { kind: 'openLink'; link: Link }
  | { kind: 'askReplace'; link: Link }
  | { kind: 'switchMage'; mageId: string }
  | { kind: 'askNewBook'; mageId: string };

const resolveLink = <Link extends LinkContent>(
  current: Book,
  link: Link | 'unreadable',
): UrlBookAction<Link> => {
  if (link === 'unreadable') {
    return { kind: 'unreadableLink' };
  }

  const wouldLoseCards = hasCards(current) && !sameBook(current, link.book);

  if (wouldLoseCards) {
    return { kind: 'askReplace', link };
  }

  return { kind: 'openLink', link };
};

const resolveRouteMage = <Link extends LinkContent>(
  current: Book,
  routeMageId: string,
): UrlBookAction<Link> => {
  const kind = mageSwitchKind(current, routeMageId);

  if (kind === 'sameMage') {
    return { kind: 'keep' };
  }

  if (kind === 'newBook') {
    return { kind: 'askNewBook', mageId: routeMageId };
  }

  return { kind: 'switchMage', mageId: routeMageId };
};

/**
 * Settles the book against the URL: a share link wins over the mage in the path, and
 * either one asks first when it would clear a book that has cards.
 */
export const resolveUrlBook = <Link extends LinkContent>({
  current,
  routeMageId,
  link,
}: UrlBookInput<Link>): UrlBookAction<Link> => {
  if (link !== null) {
    return resolveLink(current, link);
  }

  if (routeMageId !== null) {
    return resolveRouteMage(current, routeMageId);
  }

  return { kind: 'keep' };
};
