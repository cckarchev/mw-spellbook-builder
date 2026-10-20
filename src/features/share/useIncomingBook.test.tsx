import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { toBase64Url } from '@/core/share-link/base64Url';
import { encodeBook } from '@/core/share-link/bookCodec';
import { cardsById } from '@/data/catalog';
import { FIREBALL, overBudgetBook, smallBook } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';

const FIREBALL_CODE = cardsById.get(FIREBALL)?.code ?? '';
const OVER_LIMIT = 5;

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  useBookStore.getState().clear();
});

describe('opening a share link', () => {
  it('loads the book and shows it on the Book tab', () => {
    renderAt(`/?b=${encodeBook(smallBook)}`);

    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(screen.getByRole('tab', { name: 'Book' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('loads what it can and lists the problems', async () => {
    const wire = { v: 1, m: 'wizard', s: 'Fire', c: { deadbeef: 1, [FIREBALL_CODE]: OVER_LIMIT } };

    renderAt(`/?b=${toBase64Url(JSON.stringify(wire))}`);

    expect(useBookStore.getState().book.counts).toEqual({ [FIREBALL]: OVER_LIMIT });

    const dialog = screen.getByRole('dialog', { name: 'Check this book' });

    expect(
      within(dialog).getByText('1 card in the link is not in the catalog and was left out'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Fireball: 5 copies, max 4')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the current book when the link cannot be read', () => {
    useBookStore.getState().loadBook(smallBook);

    renderAt('/?b=not-a-book');

    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(screen.getByRole('dialog', { name: 'Check this book' })).toHaveTextContent(
      'This link could not be read',
    );
    // It stays where the link was opened, here the mage picker.
    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });

  it('names an unknown mage and still reports the cards left out', () => {
    const wire = { v: 1, m: 'archmage', c: { deadbeef: 1 } };

    renderAt(`/wizard?b=${toBase64Url(JSON.stringify(wire))}`);

    const dialog = screen.getByRole('dialog', { name: 'Check this book' });

    expect(dialog).toHaveTextContent('The mage in this link (archmage) is not in the catalog.');
    expect(dialog).toHaveTextContent('1 card in the link is not in the catalog and was left out');
    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });
});

describe('opening a share link over a book in progress', () => {
  beforeEach(() => {
    useBookStore.getState().loadBook(overBudgetBook);
  });

  it('asks before replacing it, and Cancel keeps it', async () => {
    renderAt(`/wizard?b=${encodeBook(smallBook)}`);

    const dialog = screen.getByRole('dialog', { name: 'Replace your book?' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useBookStore.getState().book).toEqual(overBudgetBook);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('replaces it when confirmed', async () => {
    renderAt(`/wizard?b=${encodeBook(smallBook)}`);

    await userEvent.click(screen.getByRole('button', { name: 'Replace' }));

    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(screen.getByRole('tab', { name: 'Book' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps a book of another mage on Cancel, with no second question', async () => {
    const warlockBook = { mageId: 'warlock', counts: { [FIREBALL]: 1 } };

    useBookStore.getState().loadBook(warlockBook);
    renderAt(`/wizard?b=${encodeBook(smallBook)}`);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(useBookStore.getState().book).toEqual(warlockBook);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Book' })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens the same book without asking', () => {
    useBookStore.getState().loadBook(smallBook);

    renderAt(`/wizard?b=${encodeBook(smallBook)}`);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
