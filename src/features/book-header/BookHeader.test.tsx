import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Book } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { cardsById } from '@/data/catalog';
import {
  overBudgetBook,
  overWithProblemBook,
  smallBook,
  tooManyCopiesBook,
  wizard,
} from '@/features/shared/testBooks';
import { BookHeader } from './BookHeader';

const renderHeader = (book: Book) => {
  render(<BookHeader mage={wizard} summary={summarizeBook(book, wizard, cardsById)} />);
};

const summaryRegion = () => screen.getByRole('region', { name: 'Book summary' });

describe('BookHeader', () => {
  it('shows the mage and the points used out of the budget', () => {
    renderHeader(smallBook);

    expect(screen.getByRole('heading', { level: 1, name: 'Wizard' })).toBeInTheDocument();
    expect(screen.getByText('18 / 120')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'valid');
  });

  it('turns to the error state over budget', () => {
    renderHeader(overBudgetBook);

    expect(screen.getByText('122 / 120')).toBeInTheDocument();
    expect(screen.getByText('2 over')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'over');
  });

  it('counts the problems of a book within budget', () => {
    renderHeader(tooManyCopiesBook);

    expect(screen.getByText('1 problem')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'invalid');
  });

  it('shows both the points over and the problems', () => {
    renderHeader(overWithProblemBook);

    expect(screen.getByText('10 over · 1 problem')).toBeInTheDocument();
    expect(summaryRegion()).toHaveAttribute('data-state', 'over');
  });
});

describe('BookHeader stats card', () => {
  it('shows the mage stats card from the mage name', async () => {
    renderHeader(smallBook);

    await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));

    const dialog = screen.getByRole('dialog', { name: 'Wizard stats' });

    expect(within(dialog).getByRole('img', { name: 'Wizard stats card' })).toBeInTheDocument();
  });
});
