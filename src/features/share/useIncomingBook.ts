import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { readDraft } from '@/core/persistence/drafts';
import { savedCopy } from '@/core/persistence/savedBooks';
import { builderPath, PICKER_PATH } from '@/core/routing/builderPath';
import { hasUnsavedChanges, sameBook } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { type DecodedBook, decodeBook } from '@/core/share-link/bookCodec';
import { incomingProblems, noMageProblems } from '@/core/share-link/bookNotes';
import { BOOK_PARAM } from '@/core/share-link/shareUrl';
import { bookMage, cardsById } from '@/data/catalog';
import { currentBookPath } from '@/features/shared/currentBookPath';
import { useBookStore } from '@/store/useBookStore';

const UNREADABLE = 'This link could not be read. Your current book is unchanged.';

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

/** Whether opening the book would replace unsaved work in a draft of its mage. */
const replacesWork = (book: Book): boolean => {
  const draft = book.mageId === null ? null : readDraft(book.mageId);

  if (draft === null) {
    return false;
  }

  const saved = savedCopy(draft.book, draft.name);

  return hasUnsavedChanges(draft.book, saved) && !sameBook(draft.book, book);
};

/**
 * Loads the book from a share link (?b=) once at startup and opens it on the Book tab.
 * A draft of the link's mage with unsaved work is only replaced once the player confirms
 * it in pendingReplace; the drafts of other mages are never touched.
 * Returns the problems found in the link's book, for the player to see, until dismissed.
 */
export const useIncomingBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loadBook = useBookStore((state) => state.loadBook);
  const handled = useRef(false);

  const [problems, setProblems] = useState<string[]>([]);
  const [pendingReplace, setPendingReplace] = useState<DecodedBook | null>(null);

  const open = (decoded: DecodedBook) => {
    const { path, problems: found } = openedBook(decoded);

    loadBook(decoded.book);
    setProblems(found);
    navigate(path, { replace: true });
  };

  useEffect(() => {
    const encoded = new URLSearchParams(location.search).get(BOOK_PARAM);

    if (handled.current || encoded === null) {
      return;
    }

    handled.current = true;

    const decoded = decodeBook(encoded);
    const current = useBookStore.getState().book;

    if (!decoded) {
      setProblems([UNREADABLE]);
      navigate(currentBookPath(current, 'cards'), { replace: true });

      return;
    }

    if (replacesWork(decoded.book)) {
      // The current book stays on screen while the player decides.
      setPendingReplace(decoded);
      navigate(currentBookPath(current, 'book'), { replace: true });

      return;
    }

    open(decoded);
  });

  const confirmReplace = () => {
    if (pendingReplace) {
      open(pendingReplace);
    }

    setPendingReplace(null);
  };

  const cancelReplace = () => {
    setPendingReplace(null);
  };

  const dismiss = () => {
    setProblems([]);
  };

  return { problems, dismiss, pendingReplace, confirmReplace, cancelReplace };
};
