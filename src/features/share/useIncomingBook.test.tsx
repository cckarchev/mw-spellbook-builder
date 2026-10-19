import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { toBase64Url } from '@/core/share-link/base64Url';
import { encodeBook } from '@/core/share-link/bookCodec';
import { cardsById } from '@/data/catalog';
import { FIREBALL, smallBook } from '@/features/shared/testBooks';
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
  });
});
