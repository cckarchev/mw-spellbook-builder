import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Spellbook } from '@/core/rules/types';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { cardsById } from '@/data/catalog';
import {
  overBudgetSpellbook,
  overWithProblemSpellbook,
  smallSpellbook,
  tooManyCopiesSpellbook,
  wizard,
} from '@/features/shared/testSpellbooks';
import { SpellbookHeader } from './SpellbookHeader';

const renderHeader = (spellbook: Spellbook, name: string | null = null, unsaved = false) => {
  render(
    <SpellbookHeader
      mage={wizard}
      summary={summarizeSpellbook(spellbook, wizard, cardsById)}
      name={name}
      unsaved={unsaved}
    />,
  );
};

const summaryRegion = () => screen.getByRole('region', { name: 'Spellbook summary' });

describe('SpellbookHeader', () => {
  it('shows the mage and the points used out of the budget', () => {
    renderHeader(smallSpellbook);

    expect(screen.getByRole('heading', { level: 1, name: 'Wizard' })).toBeInTheDocument();
    expect(screen.getByText('18 / 120')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'valid');
  });

  it('turns to the error state over budget', () => {
    renderHeader(overBudgetSpellbook);

    expect(screen.getByText('122 / 120')).toBeInTheDocument();
    expect(screen.getByText('2 over')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'over');
  });

  it('counts the problems of a spellbook within budget', () => {
    renderHeader(tooManyCopiesSpellbook);

    expect(screen.getByText('1 problem')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'invalid');
  });

  it('shows both the points over and the problems', () => {
    renderHeader(overWithProblemSpellbook);

    expect(screen.getByText('10 over · 1 problem')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'over');
  });
});

describe('SpellbookHeader stats card', () => {
  it('shows the mage stats card from the mage name', async () => {
    renderHeader(smallSpellbook);

    await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));

    const dialog = screen.getByRole('dialog', { name: 'Wizard stats' });

    expect(within(dialog).getByRole('img', { name: 'Wizard stats card' })).toBeInTheDocument();
  });
});

describe('SpellbookHeader spellbook name', () => {
  it('shows the name of a saved spellbook', () => {
    renderHeader(smallSpellbook, 'Tourney');

    expect(screen.getByText('Tourney')).toBeInTheDocument();
    expect(screen.queryByText('unsaved')).not.toBeInTheDocument();
  });

  it('marks unsaved changes', () => {
    renderHeader(smallSpellbook, 'Tourney', true);

    expect(screen.getByText('unsaved')).toBeInTheDocument();
  });

  it('shows neither for a spellbook with no name', () => {
    renderHeader(smallSpellbook, null, true);

    expect(screen.queryByText('unsaved')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Wizard$/);
  });
});
