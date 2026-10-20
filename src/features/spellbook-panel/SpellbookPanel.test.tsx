import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Spellbook } from '@/core/rules/types';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { cardsById } from '@/data/catalog';
import {
  FIREBALL,
  smallSpellbook,
  tooManyCopiesSpellbook,
  wizard,
} from '@/features/shared/testSpellbooks';
import { type ViewMode, viewModeStorageKey } from '@/features/shared/view-switch/useViewMode';
import { SpellbookPanel } from './SpellbookPanel';

const ONE_FIREBALL: Spellbook = {
  ...smallSpellbook,
  counts: { ...smallSpellbook.counts, [FIREBALL]: 1 },
};

const renderSpellbookPanel = (spellbook: Spellbook = smallSpellbook, view: ViewMode = 'list') => {
  const onRemove = vi.fn();

  localStorage.setItem(viewModeStorageKey('spellbook'), view);

  render(
    <SpellbookPanel
      spellbook={spellbook}
      mage={wizard}
      summary={summarizeSpellbook(spellbook, wizard, cardsById)}
      onAdd={vi.fn()}
      onRemove={onRemove}
    />,
  );

  return { onRemove };
};

const removeOneFireball = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Remove one Fireball' }));
};

describe('SpellbookPanel', () => {
  it('groups the spellbook by type with a point subtotal per group', () => {
    renderSpellbookPanel();

    // Copies per group, then the group subtotal.
    const attack = screen.getByRole('region', { name: 'Attack (5) 16 pts' });
    const conjuration = screen.getByRole('region', { name: 'Conjuration (2) 2 pts' });

    expect(within(attack).getByText('Fireball')).toBeInTheDocument();
    expect(within(attack).getByText('Lightning Bolt')).toBeInTheDocument();
    expect(within(conjuration).getByText('Mana Crystal')).toBeInTheDocument();
  });

  it('lists the problems of the spellbook', () => {
    renderSpellbookPanel(tooManyCopiesSpellbook);

    const problems = screen.getByRole('list', { name: 'Problems' });

    expect(within(problems).getByText('Fireball: 5 copies, max 4')).toBeInTheDocument();
  });

  it('marks the card row that has a problem', () => {
    renderSpellbookPanel(tooManyCopiesSpellbook);

    const row = screen.getByText('Too many copies: max 4').closest('li');

    expect(row).toHaveAttribute('data-problem', 'true');
    expect(within(row as HTMLElement).getByText('Fireball')).toBeInTheDocument();
  });

  it('shows no problem list for a legal spellbook', () => {
    renderSpellbookPanel();

    expect(screen.queryByRole('list', { name: 'Problems' })).not.toBeInTheDocument();
  });

  it('says when the spellbook is empty', () => {
    renderSpellbookPanel({ ...smallSpellbook, counts: {} });

    expect(screen.getByText('No cards yet. Add some from the Cards tab.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Grid' })).not.toBeInTheDocument();
  });

  it('removes a copy without asking while more copies stay', async () => {
    const { onRemove } = renderSpellbookPanel();

    await removeOneFireball();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onRemove).toHaveBeenCalledWith(FIREBALL);
  });

  it('asks before removing the last copy, and Cancel keeps it', async () => {
    const { onRemove } = renderSpellbookPanel(ONE_FIREBALL);

    await removeOneFireball();

    const dialog = screen.getByRole('dialog', { name: 'Remove Fireball?' });

    expect(dialog).toHaveTextContent('It is the last copy, so the card leaves the spellbook.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('removes the last copy when confirmed', async () => {
    const { onRemove } = renderSpellbookPanel(ONE_FIREBALL);

    await removeOneFireball();
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledWith(FIREBALL);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('SpellbookPanel grid', () => {
  it('shows the cards as images with the points of every copy', () => {
    renderSpellbookPanel(smallSpellbook, 'grid');

    const attack = screen.getByRole('region', { name: 'Attack (5) 16 pts' });
    const tile = within(attack).getByRole('img', { name: 'Fireball' }).closest('li');

    // Three copies at 4 points each.
    expect(tile).toHaveTextContent('12 pts');
    expect(
      within(tile as HTMLElement).getByRole('button', { name: 'Add one Fireball' }),
    ).toBeInTheDocument();
  });

  it('marks the card that has a problem', () => {
    renderSpellbookPanel(tooManyCopiesSpellbook, 'grid');

    const tile = screen.getByText('Too many copies: max 4').closest('li');

    expect(tile).toHaveAttribute('data-problem', 'true');
    expect(within(tile as HTMLElement).getByRole('img', { name: 'Fireball' })).toBeInTheDocument();
  });
});
