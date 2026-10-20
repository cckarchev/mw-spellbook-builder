import { render, screen } from '@testing-library/react';
import type { Spellbook } from '@/core/rules/types';
import {
  LIGHTNING_BOLT,
  MANA_CRYSTAL,
  smallSpellbook,
  wizard,
} from '@/features/shared/testSpellbooks';
import { SpellbookStats } from './SpellbookStats';

const withCounts = (counts: Spellbook['counts']): Spellbook => ({ ...smallSpellbook, counts });

const SECTION_HEADINGS = [
  'Mana curve',
  'By type',
  'Points by school',
  'By level',
  'Actions',
  'Attacks',
];

const renderStats = (spellbook: Spellbook) => {
  render(<SpellbookStats spellbook={spellbook} mage={wizard} />);
};

describe('SpellbookStats', () => {
  it('asks for cards when the book is empty', () => {
    renderStats(withCounts({}));

    expect(screen.getByText('Add cards to see stats.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mana curve' })).not.toBeInTheDocument();
  });

  it('shows the curve sentence', () => {
    renderStats(withCounts({ [LIGHTNING_BOLT]: 2 }));

    expect(
      screen.getByText('Wizard channels 10 per round. 2 cards cost 10 or less, 0 cost more.'),
    ).toBeInTheDocument();
  });

  it('lists mana sources', () => {
    renderStats(withCounts({ [MANA_CRYSTAL]: 2 }));

    expect(screen.getByText('Mana sources in book: Mana Crystal ×2: up to +2')).toBeInTheDocument();
  });

  it('hides the mana sources line when the book has none', () => {
    renderStats(withCounts({ [LIGHTNING_BOLT]: 2 }));

    expect(screen.queryByText(/Mana sources in book/)).not.toBeInTheDocument();
  });

  it('notes untrained points', () => {
    // Three Fireballs, level 2 Fire, which the Wizard is not trained in: 3 x 2 x 2.
    renderStats(smallSpellbook);

    expect(screen.getByText('12 of 120 points go to untrained schools.')).toBeInTheDocument();
  });

  it('has no untrained note when every school is trained', () => {
    renderStats(withCounts({ [LIGHTNING_BOLT]: 2 }));

    expect(screen.queryByText(/go to untrained schools/)).not.toBeInTheDocument();
  });

  it('shows no attacks', () => {
    renderStats(withCounts({ [MANA_CRYSTAL]: 1 }));

    expect(screen.getByText('No attacks.')).toBeInTheDocument();
  });

  it('renders every section heading in order', () => {
    renderStats(smallSpellbook);

    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent);

    expect(headings).toEqual(SECTION_HEADINGS);
  });
});
