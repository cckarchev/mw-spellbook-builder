import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import {
  LIGHTNING_BOLT,
  resetSpellbookStore,
  smallSpellbook,
} from '@/features/shared/testSpellbooks';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { stubMatchMedia } from '@/test/stubMatchMedia';

const EMPTY_STATS = 'Add cards to see stats.';

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

const tabNames = (): string[] => screen.getAllByRole('tab').map((tab) => tab.textContent ?? '');

beforeEach(() => {
  resetSpellbookStore();
  useCatalogFiltersStore.getState().reset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Builder stats tab below desktop', () => {
  beforeEach(() => {
    stubMatchMedia(false);
  });

  it('has a Stats tab after Spellbook', async () => {
    useSpellbookStore.getState().loadSpellbook({ ...smallSpellbook, counts: {} });
    renderAt('/wizard');

    expect(tabNames()).toEqual(['Cards', 'Spellbook', 'Stats']);

    await userEvent.click(screen.getByRole('tab', { name: 'Stats' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent(EMPTY_STATS);
  });

  it('opens stats from the URL', () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
    renderAt('/wizard/stats');

    expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Mana curve' })).toBeInTheDocument();
  });

  it('shows the empty message after the book is emptied', () => {
    useSpellbookStore.getState().loadSpellbook({
      ...smallSpellbook,
      counts: { [LIGHTNING_BOLT]: 1 },
    });
    renderAt('/wizard/stats');

    expect(screen.getByRole('heading', { name: 'Mana curve' })).toBeInTheDocument();

    act(() => {
      useSpellbookStore.getState().removeCopy(LIGHTNING_BOLT);
    });

    expect(screen.getByText(EMPTY_STATS)).toBeInTheDocument();
  });
});

describe('Builder stats tab on desktop', () => {
  const spellbookColumn = () => screen.getByRole('complementary', { name: 'Spellbook' });

  beforeEach(() => {
    stubMatchMedia(true);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
  });

  it('switches the spellbook column between spellbook and stats', async () => {
    renderAt('/wizard');

    expect(tabNames()).toEqual(['Spellbook', 'Stats']);
    expect(screen.getByRole('tab', { name: 'Spellbook' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(screen.getByRole('tab', { name: 'Stats' }));

    expect(
      within(spellbookColumn()).getByRole('heading', { name: 'Mana curve' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Catalog' })).toBeInTheDocument();
  });

  it('opens the stats in the column from the URL', () => {
    renderAt('/wizard/stats');

    expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('region', { name: 'Catalog' })).toBeInTheDocument();
  });
});
