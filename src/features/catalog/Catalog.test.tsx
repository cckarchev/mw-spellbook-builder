import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EMPTY_FILTERS, filterCards } from '@/core/catalog/filterCards';
import type { Spellbook } from '@/core/rules/types';
import { cards } from '@/data/catalog';
import { LIGHTNING_BOLT, smallSpellbook, wizard } from '@/features/shared/testSpellbooks';
import { Catalog } from './Catalog';
import { useCatalogFiltersStore } from './useCatalogFilters';

const BOLT_LIMIT = 4;

const EMPTY_SPELLBOOK: Spellbook = { mageId: wizard.id, counts: {} };

beforeEach(() => {
  useCatalogFiltersStore.getState().reset();
  localStorage.clear();
});

const renderCatalog = (spellbook: Spellbook = smallSpellbook) => {
  const onAdd = vi.fn();
  const onRemove = vi.fn();

  render(<Catalog spellbook={spellbook} mage={wizard} onAdd={onAdd} onRemove={onRemove} />);

  return { onAdd, onRemove };
};

/** The header button of a type section, such as "Attack (52)". */
const sectionToggle = (type: string): HTMLElement =>
  screen.getByRole('button', { name: new RegExp(`^${type} \\(`) });

/** Opens a type section by tapping its header. */
const openSection = async (type: string) => {
  await userEvent.click(sectionToggle(type));
};

/** The catalog row of a card, found by its name. */
const rowOf = (name: string): HTMLElement => {
  const row = screen.getByText(name, { selector: '[data-card-name]' }).closest('li');

  if (!row) {
    throw new Error(`No row for ${name}`);
  }

  return row;
};

const rowNames = (): string[] =>
  Array.from(document.querySelectorAll('[data-card-name]')).map((node) => node.textContent ?? '');

describe('Catalog listing', () => {
  it('starts with every type section collapsed', () => {
    renderCatalog();

    expect(rowNames()).toEqual([]);
    expect(sectionToggle('Attack')).toHaveAttribute('aria-expanded', 'false');
  });

  it('lists only the cards the mage can use', async () => {
    renderCatalog();

    await openSection('Attack');

    expect(rowOf('Fireball')).toBeInTheDocument();
    expect(screen.queryByText("Adramelech's Torment")).not.toBeInTheDocument();
  });

  it('groups the cards under type headers with a count', () => {
    renderCatalog(EMPTY_SPELLBOOK);

    const legal = filterCards(cards, EMPTY_FILTERS, wizard);
    const attackCount = legal.filter((card) => card.type === 'Attack').length;

    expect(screen.getByRole('heading', { name: `Attack (${attackCount})` })).toBeInTheDocument();
  });

  it('shows how many copies of each type the spellbook has and their points', () => {
    renderCatalog();

    expect(sectionToggle('Attack')).toHaveTextContent('5 in spellbook · 16 pts');
    expect(sectionToggle('Creature')).not.toHaveTextContent('in spellbook');
  });

  it('opens the sections while the player searches, to show the matches', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('searchbox', { name: 'Search cards' }));
    await userEvent.paste('fireball');

    expect(rowNames()).toEqual(['Fireball', 'Twin Fireball']);
  });

  it('clears the search from the clear button', async () => {
    renderCatalog();

    const search = screen.getByRole('searchbox', { name: 'Search cards' });

    await userEvent.click(search);
    await userEvent.paste('fireball');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
  });
});

describe('Catalog rows', () => {
  it('shows why + is blocked at the copy limit', async () => {
    const { onAdd } = renderCatalog({
      ...smallSpellbook,
      counts: { ...smallSpellbook.counts, [LIGHTNING_BOLT]: BOLT_LIMIT },
    });

    await openSection('Attack');

    const row = rowOf('Lightning Bolt');
    const add = within(row).getByRole('button', { name: 'Add one Lightning Bolt' });

    expect(add).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(add);

    expect(screen.getByRole('status')).toHaveTextContent('Max 4 copies');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('hides why + is blocked on a tap elsewhere', async () => {
    renderCatalog({
      ...smallSpellbook,
      counts: { ...smallSpellbook.counts, [LIGHTNING_BOLT]: BOLT_LIMIT },
    });

    await openSection('Attack');

    const row = rowOf('Lightning Bolt');

    await userEvent.click(within(row).getByRole('button', { name: 'Add one Lightning Bolt' }));
    await userEvent.click(document.body);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('adds a copy with +', async () => {
    const { onAdd } = renderCatalog();

    await openSection('Attack');
    await userEvent.click(
      within(rowOf('Fireball')).getByRole('button', { name: 'Add one Fireball' }),
    );

    expect(onAdd).toHaveBeenCalledWith('d8562a1d-6a95-4ca4-99aa-91c5ca769a33');
  });

  it('opens the card image when the row is tapped', async () => {
    renderCatalog();

    await openSection('Attack');

    const row = rowOf('Fireball');

    expect(within(row).queryByRole('img')).not.toBeInTheDocument();

    await userEvent.click(within(row).getByRole('button', { expanded: false }));

    expect(within(row).getByRole('img', { name: 'Fireball' })).toHaveAttribute(
      'src',
      '/cards/d8562a1d.webp',
    );
  });
});

describe('Catalog grid', () => {
  const showGrid = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Grid' }));
  };

  /** The grid tile of a card, found by its image. */
  const tileOf = (name: string): HTMLElement => {
    const tile = screen.getByRole('img', { name }).closest('li');

    if (!tile) {
      throw new Error(`No tile for ${name}`);
    }

    return tile;
  };

  it('starts as a list, with the view names as tooltips', () => {
    renderCatalog();

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('title', 'Grid');

    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the cards as images with their points', async () => {
    renderCatalog();

    await showGrid();
    await openSection('Attack');

    const tile = tileOf('Fireball');

    expect(within(tile).getByRole('img')).toHaveAttribute('src', '/cards/d8562a1d.webp');
    expect(tile).toHaveTextContent('4 pts');
    expect(rowNames()).toEqual([]);
  });

  it('adds a copy with +', async () => {
    const { onAdd } = renderCatalog();

    await showGrid();
    await openSection('Attack');
    await userEvent.click(
      within(tileOf('Fireball')).getByRole('button', { name: 'Add one Fireball' }),
    );

    expect(onAdd).toHaveBeenCalledWith('d8562a1d-6a95-4ca4-99aa-91c5ca769a33');
  });

  it('enlarges the card when its image is tapped', async () => {
    renderCatalog();

    await showGrid();
    await openSection('Attack');
    await userEvent.click(screen.getByRole('button', { name: 'Enlarge Fireball' }));

    expect(screen.getByRole('dialog', { name: 'Fireball' })).toBeInTheDocument();
  });

  it('comes back as a grid the next time', async () => {
    renderCatalog();

    await showGrid();
    cleanup();
    renderCatalog();

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Catalog filter panel', () => {
  const openFilters = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
  };

  const groupToggle = (title: string): HTMLElement =>
    screen.getByRole('button', { name: new RegExp(`^${title}`) });

  it('starts with Subtype and Expansion folded away and the other groups open', async () => {
    renderCatalog();

    await openFilters();

    expect(groupToggle('Subtype')).toHaveAttribute('aria-expanded', 'false');
    expect(groupToggle('Expansion')).toHaveAttribute('aria-expanded', 'false');
    expect(groupToggle('School')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('button', { name: 'Lightning' })).not.toBeInTheDocument();
  });

  it('narrows the chips to the values that match the filter search', async () => {
    renderCatalog();

    await openFilters();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a filter' }), 'light');

    expect(screen.getByRole('button', { name: 'Lightning' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fire' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Expansion/ })).not.toBeInTheDocument();
  });

  it('keeps a selected chip shown when the filter search does not match it', async () => {
    renderCatalog();

    await openFilters();
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a filter' }), 'light');

    expect(screen.getByRole('button', { name: 'Fire' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Catalog quick picks and count', () => {
  const legal = filterCards(cards, EMPTY_FILTERS, wizard);
  const onlyCount = legal.filter((card) => card.onlyFor !== null).length;

  const pick = async (label: string) => {
    await userEvent.click(screen.getByRole('button', { name: /^Filters/ }));

    const picks = screen.getByRole('group', { name: 'Show' });

    await userEvent.click(within(picks).getByRole('button', { name: label }));
  };

  const count = () => screen.getByText(/^Showing /);

  it('shows no count and keeps the quick picks folded away while nothing is filtered', () => {
    renderCatalog();

    expect(screen.queryByText(/^Showing /)).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Show' })).not.toBeInTheDocument();
  });

  it('counts Mage only on the Filters button, and Clear undoes it', async () => {
    renderCatalog();

    await pick('Mage only');

    expect(screen.getByRole('button', { name: 'Filters (1)' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.queryByText(/^Showing /)).not.toBeInTheDocument();
  });

  it("fills the school chips with the mage's schools for Trained", async () => {
    renderCatalog();

    await pick('Trained');

    expect(screen.getByRole('button', { name: 'Arcane' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Air' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows only the "Only" cards of the mage, with how many of all', async () => {
    renderCatalog();

    await pick('Mage only');

    expect(count()).toHaveTextContent(`Showing ${onlyCount} of ${legal.length} cards`);
    expect(count()).toHaveAttribute('data-empty', 'false');
  });

  it('marks the count when nothing matches', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('searchbox', { name: 'Search cards' }));
    await userEvent.paste('zzzz');

    expect(count()).toHaveTextContent(`Showing 0 of ${legal.length} cards`);
    expect(count()).toHaveAttribute('data-empty', 'true');
  });
});
