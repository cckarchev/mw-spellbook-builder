import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { readDraft } from '@/core/persistence/drafts';
import { sameSpellbook } from '@/core/rules/spellbookChanges';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { FIREBALL, resetSpellbookStore, smallSpellbook } from '@/features/shared/testSpellbooks';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { stubMatchMedia } from '@/test/stubMatchMedia';
import { App } from './App';

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  resetSpellbookStore();
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
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
  });

  it('opens the Spellbook tab at the mage spellbook path', () => {
    renderAt('/wizard/spellbook');

    expect(screen.getByRole('tab', { name: 'Spellbook' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Mana Crystal');
  });

  it('switches tabs', async () => {
    renderAt('/wizard/spellbook');

    await userEvent.click(screen.getByRole('tab', { name: 'Cards' }));

    expect(screen.getByRole('tab', { name: 'Cards' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
  });

  it('keeps the search when the player comes back from the Spellbook tab', async () => {
    renderAt('/wizard');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'fireball');
    await userEvent.click(screen.getByRole('tab', { name: 'Spellbook' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Cards' }));

    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toHaveValue('fireball');
  });

  it('starts with no filters for another mage', async () => {
    renderAt('/wizard');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), 'fireball');
    cleanup();
    useSpellbookStore.getState().loadSpellbook({ mageId: 'priest', counts: {} });
    renderAt('/priest');

    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toHaveValue('');
  });
});

describe('App opened at another mage', () => {
  const currentMage = () => useSpellbookStore.getState().spellbook.mageId;

  it('switches right away when the spellbook has no cards', () => {
    useSpellbookStore.getState().loadSpellbook({ mageId: 'wizard', counts: {} });

    renderAt('/warlock');

    expect(currentMage()).toBe('warlock');
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
  });

  it('opens the mage without asking and keeps the old spellbook as its draft', () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);

    renderAt('/warlock/spellbook');

    const wizardDraft = readDraft('wizard');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(currentMage()).toBe('warlock');
    expect(wizardDraft && sameSpellbook(wizardDraft.spellbook, smallSpellbook)).toBe(true);
  });

  it('brings the old spellbook back on its mage URL', () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
    renderAt('/warlock');
    cleanup();

    renderAt('/wizard/spellbook');

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Mana Crystal');
  });
});

describe('App build screen on desktop', () => {
  const spellbookColumn = () => screen.getByRole('complementary', { name: 'Spellbook' });
  const catalogColumn = () => screen.getByRole('region', { name: 'Catalog' });

  const searchCards = async (text: string) => {
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search cards' }), text);
  };

  beforeEach(() => {
    stubMatchMedia(true);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the catalog and the spellbook without tabs', () => {
    renderAt('/wizard');

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
    expect(spellbookColumn()).toHaveTextContent('Mana Crystal');
  });

  it('shows the same screen at the spellbook path', () => {
    renderAt('/wizard/spellbook');

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search cards' })).toBeInTheDocument();
    expect(spellbookColumn()).toHaveTextContent('Mana Crystal');
  });

  it('adds a card from the catalog to the spellbook column', async () => {
    renderAt('/wizard');

    await searchCards('dispel');
    await userEvent.click(within(catalogColumn()).getByRole('button', { name: 'Add one Dispel' }));

    expect(spellbookColumn()).toHaveTextContent('Dispel');
  });

  it('removes the last copy from the catalog without asking', async () => {
    useSpellbookStore.getState().loadSpellbook({ ...smallSpellbook, counts: { [FIREBALL]: 1 } });
    renderAt('/wizard');

    await searchCards('fireball');
    await userEvent.click(
      within(catalogColumn()).getByRole('button', { name: 'Remove one Fireball' }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(spellbookColumn()).not.toHaveTextContent('Fireball');
  });

  it('goes back to tabs when the window narrows', () => {
    vi.unstubAllGlobals();
    const { setMatches } = stubMatchMedia(true);
    renderAt('/wizard');

    act(() => {
      setMatches(false);
    });

    expect(screen.getByRole('tab', { name: 'Cards' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('complementary', { name: 'Spellbook' })).not.toBeInTheDocument();
  });
});
