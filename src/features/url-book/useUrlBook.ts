import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  bookPath,
  builderPath,
  PICKER_PATH,
  slugFromPath,
  tabFromPath,
} from '@/core/routing/paths';
import { resolveUrlBook } from '@/core/routing/resolveUrlBook';
import type { Mage } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { type DecodedBook, decodeBook } from '@/core/share-link/bookCodec';
import { incomingProblems, noMageProblems } from '@/core/share-link/bookNotes';
import { BOOK_PARAM } from '@/core/share-link/shareUrl';
import { bookMage, cardsById, magesBySlug } from '@/data/catalog';
import { useStartNewBook } from '@/features/mage-switch/useStartNewBook';
import { useBookStore } from '@/store/useBookStore';

const UNREADABLE = 'This link could not be read. Your current book is unchanged.';

/** A question waiting on the player before the URL may replace or clear the book. */
type PendingQuestion =
  | { kind: 'askReplace'; decoded: DecodedBook }
  | { kind: 'askNewBook'; mage: Mage };

/** Where a book opened from a link goes, and what to tell the player about it. */
const openedBook = ({ book, unknownCodes, unknownMage }: DecodedBook) => {
  const mage = bookMage(book);

  if (!mage) {
    return { path: PICKER_PATH, problems: noMageProblems(unknownMage, unknownCodes) };
  }

  const { issues } = summarizeBook(book, mage, cardsById);

  return {
    path: builderPath(mage.name, 'book'),
    problems: incomingProblems(unknownCodes, issues, mage, book.counts, cardsById),
  };
};

/** The share link of the URL, decoded, "unreadable", or null when there is none. */
const readLink = (search: string): DecodedBook | 'unreadable' | null => {
  const encoded = new URLSearchParams(search).get(BOOK_PARAM);

  if (encoded === null) {
    return null;
  }

  return decodeBook(encoded) ?? 'unreadable';
};

/**
 * Settles the book against the URL every time the URL changes: a share link (?b=) opens its
 * book on the Book tab, and a mage in the path switches to that mage. When either would clear
 * a book with cards, it waits in `pending` for the player; Cancel goes back to the book's mage.
 */
export const useUrlBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loadBook = useBookStore((state) => state.loadBook);
  const startNewBook = useStartNewBook();

  const [problems, setProblems] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingQuestion | null>(null);

  const open = useCallback(
    (decoded: DecodedBook) => {
      const { path, problems: found } = openedBook(decoded);

      loadBook(decoded.book);
      setProblems(found);
      navigate(path, { replace: true });
    },
    [loadBook, navigate],
  );

  // Reads the book from the store, not from a render: it runs on URL changes only, so a book
  // cleared on the way out of the builder does not bring the mage of the URL being left back.
  useEffect(() => {
    const link = readLink(location.search);
    const slug = slugFromPath(location.pathname);
    const routeMage = slug === null ? undefined : magesBySlug.get(slug);
    const current = useBookStore.getState().book;
    const action = resolveUrlBook({ current, routeMageId: routeMage?.id ?? null, link });

    // A new URL answers any question the last one asked.
    setPending(null);

    if (action.kind === 'unreadableLink') {
      setProblems([UNREADABLE]);
      navigate(location.pathname, { replace: true });
    }

    if (action.kind === 'openLink') {
      open(action.link);
    }

    if (action.kind === 'askReplace') {
      setPending({ kind: 'askReplace', decoded: action.link });
    }

    if (action.kind === 'switchMage') {
      loadBook(action.book);
    }

    if (action.kind === 'askNewBook' && routeMage) {
      setPending({ kind: 'askNewBook', mage: routeMage });
    }
  }, [location.pathname, location.search, navigate, open, loadBook]);

  const confirm = () => {
    if (pending?.kind === 'askReplace') {
      open(pending.decoded);
    }

    if (pending?.kind === 'askNewBook') {
      startNewBook(pending.mage);
    }

    setPending(null);
  };

  // The URL asked for another book; the player keeps this one, so the URL goes back to it:
  // to the Book tab after a share link, to the tab the URL named after a mage path.
  const cancel = () => {
    const current = useBookStore.getState().book;
    const tab = pending?.kind === 'askReplace' ? 'book' : tabFromPath(location.pathname);

    setPending(null);
    navigate(bookPath(bookMage(current), tab), { replace: true });
  };

  const dismissProblems = () => {
    setProblems([]);
  };

  return { problems, dismissProblems, pending, confirm, cancel };
};
