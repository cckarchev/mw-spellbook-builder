import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { smallBook } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';
import { APP_NAME } from './AppHeader';

const EMPTY_BOOK = { mageId: null, counts: {} };

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

const clickAppName = async () => {
  await userEvent.click(screen.getByRole('link', { name: APP_NAME }));
};

const pickerHeading = () => screen.queryByRole('heading', { name: 'Choose a mage' });

beforeEach(() => {
  useBookStore.getState().clear();
  useCatalogFiltersStore.getState().reset();
});

describe('AppHeader', () => {
  it('goes home with a new book, without asking, when the book has no cards', async () => {
    useBookStore.getState().loadBook({ mageId: 'wizard', counts: {} });
    renderAt('/build');

    await clickAppName();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useBookStore.getState().book).toEqual(EMPTY_BOOK);
    expect(pickerHeading()).toBeInTheDocument();
  });

  it('asks before discarding a book with cards, and Cancel keeps it', async () => {
    useBookStore.getState().loadBook(smallBook);
    renderAt('/build');

    await clickAppName();

    const dialog = screen.getByRole('dialog', { name: 'Discard this book?' });

    expect(dialog).toHaveTextContent('Your Wizard book has 7 cards. It will be cleared.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(pickerHeading()).not.toBeInTheDocument();
  });

  it('clears the book and the filters when confirmed', async () => {
    useBookStore.getState().loadBook(smallBook);
    renderAt('/build');

    await userEvent.type(screen.getByRole('searchbox'), 'fire');
    await clickAppName();
    await userEvent.click(screen.getByRole('button', { name: 'Discard and go home' }));

    expect(useBookStore.getState().book).toEqual(EMPTY_BOOK);
    expect(useCatalogFiltersStore.getState().filters.query).toBe('');
    expect(pickerHeading()).toBeInTheDocument();
  });
});
