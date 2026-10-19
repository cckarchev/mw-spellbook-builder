import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { smallBook } from '@/features/shared/testBooks';
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
  useBookStore.getState().clear();
  useCatalogFiltersStore.getState().reset();
});

describe('App', () => {
  it('opens on the mage picker', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });

  it('sends /build back to the mage picker when no mage is chosen', () => {
    renderAt('/build');

    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });
});

describe('App build screen', () => {
  beforeEach(() => {
    useBookStore.getState().loadBook(smallBook);
  });

  it('opens the tab named in the URL', () => {
    renderAt('/build?tab=book');

    expect(screen.getByRole('tab', { name: 'Book' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Mana Crystal');
  });

  it('switches tabs', async () => {
    renderAt('/build?tab=book');

    await userEvent.click(screen.getByRole('tab', { name: 'Cards' }));

    expect(screen.getByRole('tab', { name: 'Cards' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
  });

  it('keeps the search when the player comes back from the Book tab', async () => {
    renderAt('/build');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'fireball');
    await userEvent.click(screen.getByRole('tab', { name: 'Book' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Cards' }));

    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toHaveValue('fireball');
  });

  it('starts with no filters for another mage', async () => {
    renderAt('/build');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'fireball');
    useBookStore.getState().loadBook({ mageId: 'priest', counts: {} });

    expect(await screen.findByRole('searchbox', { name: 'Search cards' })).toHaveValue('');
  });
});
