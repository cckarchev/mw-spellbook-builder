import type { Book } from '@/core/rules/types';
import { resolveUrlBook } from './resolveUrlBook';

const WIZARD = 'wizard';
const WARLOCK = 'warlock';
const CARD = 'card-1';
const ONE_COPY = 1;
const TWO_COPIES = 2;

const NO_BOOK: Book = { mageId: null, counts: {} };
const EMPTY_WIZARD: Book = { mageId: WIZARD, counts: {} };
const WIZARD_BOOK: Book = { mageId: WIZARD, counts: { [CARD]: ONE_COPY } };
const OTHER_WIZARD_BOOK: Book = { mageId: WIZARD, counts: { [CARD]: TWO_COPIES } };
const WARLOCK_BOOK: Book = { mageId: WARLOCK, counts: { [CARD]: ONE_COPY } };

describe('resolveUrlBook with a share link', () => {
  it('reports a link it could not read and keeps the book', () => {
    const action = resolveUrlBook({ current: WIZARD_BOOK, routeMageId: null, link: 'unreadable' });

    expect(action).toEqual({ kind: 'unreadableLink' });
  });

  it('opens the link book over a book with no cards', () => {
    const action = resolveUrlBook({
      current: EMPTY_WIZARD,
      routeMageId: null,
      link: { book: WARLOCK_BOOK },
    });

    expect(action).toEqual({ kind: 'openLink', link: { book: WARLOCK_BOOK } });
  });

  it('opens the same book again without asking', () => {
    const action = resolveUrlBook({
      current: WIZARD_BOOK,
      routeMageId: null,
      link: { book: WIZARD_BOOK },
    });

    expect(action).toEqual({ kind: 'openLink', link: { book: WIZARD_BOOK } });
  });

  it('asks before replacing a different book with cards', () => {
    const action = resolveUrlBook({
      current: WIZARD_BOOK,
      routeMageId: null,
      link: { book: OTHER_WIZARD_BOOK },
    });

    expect(action).toEqual({ kind: 'askReplace', link: { book: OTHER_WIZARD_BOOK } });
  });

  it('follows the link, not the mage in the path', () => {
    const action = resolveUrlBook({
      current: NO_BOOK,
      routeMageId: WIZARD,
      link: { book: WARLOCK_BOOK },
    });

    expect(action).toEqual({ kind: 'openLink', link: { book: WARLOCK_BOOK } });
  });
});

describe('resolveUrlBook with a mage in the path', () => {
  it('keeps the book of that mage', () => {
    const action = resolveUrlBook({ current: WIZARD_BOOK, routeMageId: WIZARD, link: null });

    expect(action).toEqual({ kind: 'keep' });
  });

  it('switches right away when the book has no cards', () => {
    const action = resolveUrlBook({ current: EMPTY_WIZARD, routeMageId: WARLOCK, link: null });

    expect(action).toEqual({ kind: 'switchMage', mageId: WARLOCK });
  });

  it('switches a book with no mage yet', () => {
    const action = resolveUrlBook({ current: NO_BOOK, routeMageId: WARLOCK, link: null });

    expect(action).toEqual({ kind: 'switchMage', mageId: WARLOCK });
  });

  it('asks before clearing a book of another mage with cards', () => {
    const action = resolveUrlBook({ current: WIZARD_BOOK, routeMageId: WARLOCK, link: null });

    expect(action).toEqual({ kind: 'askNewBook', mageId: WARLOCK });
  });
});

describe('resolveUrlBook with neither', () => {
  it('keeps the book', () => {
    const action = resolveUrlBook({ current: WIZARD_BOOK, routeMageId: null, link: null });

    expect(action).toEqual({ kind: 'keep' });
  });
});
