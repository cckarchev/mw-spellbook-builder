import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { readDraft } from '@/core/persistence/drafts';
import { sameBook } from '@/core/rules/bookChanges';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { resetBookStore, smallBook } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';
import { App } from './App';

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  resetBookStore();
  useCatalogFiltersStore.getState().reset();
});

describe('App', () => {
  it('opens on the mage picker', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });

  it('sends an unknown mage back to the mage picker', () => {
    renderAt('/not-a-mage');

    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });

  it('sends an unknown page under a mage back to the mage picker', () => {
    renderAt('/wizard/not-a-tab');

    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });
});

describe('App build screen', () => {
  beforeEach(() => {
    useBookStore.getState().loadBook(smallBook);
  });

  it('opens the Book tab at the mage book path', () => {
    renderAt('/wizard/book');

    expect(screen.getByRole('tab', { name: 'Book' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Mana Crystal');
  });

  it('switches tabs', async () => {
    renderAt('/wizard/book');

    await userEvent.click(screen.getByRole('tab', { name: 'Cards' }));

    expect(screen.getByRole('tab', { name: 'Cards' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
  });

  it('keeps the search when the player comes back from the Book tab', async () => {
    renderAt('/wizard');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'fireball');
    await userEvent.click(screen.getByRole('tab', { name: 'Book' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Cards' }));

    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toHaveValue('fireball');
  });

  it('starts with no filters for another mage', async () => {
    renderAt('/wizard');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'fireball');
    cleanup();
    useBookStore.getState().loadBook({ mageId: 'priest', counts: {} });
    renderAt('/priest');

    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toHaveValue('');
  });
});

describe('App opened at another mage', () => {
  const currentMage = () => useBookStore.getState().book.mageId;

  it('switches right away when the book has no cards', () => {
    useBookStore.getState().loadBook({ mageId: 'wizard', counts: {} });

    renderAt('/warlock');

    expect(currentMage()).toBe('warlock');
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
  });

  it('opens the mage without asking and keeps the old book as its draft', () => {
    useBookStore.getState().loadBook(smallBook);

    renderAt('/warlock/book');

    const wizardDraft = readDraft('wizard');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(currentMage()).toBe('warlock');
    expect(wizardDraft && sameBook(wizardDraft.book, smallBook)).toBe(true);
  });

  it('brings the old book back on its mage URL', () => {
    useBookStore.getState().loadBook(smallBook);
    renderAt('/warlock');
    cleanup();

    renderAt('/wizard/book');

    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Mana Crystal');
  });
});
