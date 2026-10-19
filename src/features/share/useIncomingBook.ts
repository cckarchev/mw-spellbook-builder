import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { summarizeBook } from '@/core/rules/validateBook';
import { decodeBook } from '@/core/share-link/bookCodec';
import { incomingProblems } from '@/core/share-link/bookNotes';
import { BOOK_PARAM } from '@/core/share-link/shareUrl';
import { cardsById, magesById } from '@/data/catalog';
import { useBookStore } from '@/store/useBookStore';

const BOOK_TAB_PATH = '/build?tab=book';
const PICKER_PATH = '/';

const UNREADABLE = 'This link could not be read. Your current book is unchanged.';
const NO_MAGE = 'The link names no mage. Choose one to keep building.';

/**
 * Loads the book from a share link (?b=) once at startup and opens it on the Book tab.
 * Returns the problems found in it, for the player to see, until dismissed.
 */
export const useIncomingBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loadBook = useBookStore((state) => state.loadBook);
  const handled = useRef(false);

  const [problems, setProblems] = useState<string[]>([]);

  useEffect(() => {
    const encoded = new URLSearchParams(location.search).get(BOOK_PARAM);

    if (handled.current || encoded === null) {
      return;
    }

    handled.current = true;

    const decoded = decodeBook(encoded);

    if (!decoded) {
      setProblems([UNREADABLE]);
      navigate(location.pathname, { replace: true });

      return;
    }

    const { book, unknownCodes } = decoded;
    const mage = book.mageId === null ? undefined : magesById.get(book.mageId);

    loadBook(book);

    if (!mage) {
      setProblems([NO_MAGE]);
      navigate(PICKER_PATH, { replace: true });

      return;
    }

    const { issues } = summarizeBook(book, mage, cardsById);

    setProblems(incomingProblems(unknownCodes, issues, mage, book.counts, cardsById));
    navigate(BOOK_TAB_PATH, { replace: true });
  }, [location, navigate, loadBook]);

  const dismiss = () => {
    setProblems([]);
  };

  return { problems, dismiss };
};
