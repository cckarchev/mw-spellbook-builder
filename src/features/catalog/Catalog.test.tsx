import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EMPTY_FILTERS, filterCards } from '@/core/catalog/filterCards';
import type { Book } from '@/core/rules/types';
import { cards } from '@/data/catalog';
import { LIGHTNING_BOLT, smallBook, wizard } from '@/features/shared/testBooks';
import { Catalog } from './Catalog';
import { useCatalogFiltersStore } from './useCatalogFilters';

const BOLT_LIMIT = 4;

const EMPTY_BOOK: Book = { mageId: wizard.id, counts: {} };

beforeEach(() => {
  useCatalogFiltersStore.getState().reset();
});

const renderCatalog = (book: Book = smallBook) => {
  const onAdd = vi.fn();
  const onRemove = vi.fn();

  render(<Catalog book={book} mage={wizard} onAdd={onAdd} onRemove={onRemove} />);

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
    renderCatalog(EMPTY_BOOK);

    const legal = filterCards(cards, EMPTY_FILTERS, wizard);
    const attackCount = legal.filter((card) => card.type === 'Attack').length;

    expect(screen.getByRole('heading', { name: `Attack (${attackCount})` })).toBeInTheDocument();
  });

  it('shows how many copies of each type the book has and their points', () => {
    renderCatalog();

    expect(sectionToggle('Attack')).toHaveTextContent('5 in book · 16 pts');
    expect(sectionToggle('Creature')).not.toHaveTextContent('in book');
  });

  it('opens the sections while the player searches, to show the matches', async () => {
    renderCatalog();

    await userEvent.click(screen.getByRole('searchbox', { name: 'Search cards' }));
    await userEvent.paste('fireball');

    expect(rowNames()).toEqual(['Fireball', 'Twin Fireball']);
  });
});

describe('Catalog rows', () => {
  it('shows why + is blocked at the copy limit', async () => {
    const { onAdd } = renderCatalog({
      ...smallBook,
      counts: { ...smallBook.counts, [LIGHTNING_BOLT]: BOLT_LIMIT },
    });

    await openSection('Attack');

    const row = rowOf('Lightning Bolt');
    const add = within(row).getByRole('button', { name: 'Add one Lightning Bolt' });

    expect(add).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(add);

    expect(within(row).getByRole('status')).toHaveTextContent('Max 4 copies');
    expect(onAdd).not.toHaveBeenCalled();
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
