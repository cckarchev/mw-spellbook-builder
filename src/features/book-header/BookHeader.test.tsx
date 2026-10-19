import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Book } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { cardsById } from '@/data/catalog';
import { overBudgetBook, smallBook, wizard } from '@/features/shared/testBooks';
import { BookHeader } from './BookHeader';

const renderHeader = (book: Book) => {
  render(
    <MemoryRouter>
      <BookHeader
        mage={wizard}
        schoolChoice={book.schoolChoice}
        summary={summarizeBook(book, wizard, cardsById)}
      />
    </MemoryRouter>,
  );
};

describe('BookHeader', () => {
  it('shows the mage, its school and the points used out of the budget', () => {
    renderHeader(smallBook);

    expect(screen.getByText('Wizard (Fire)')).toBeInTheDocument();
    expect(screen.getByText('16 / 120')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveAttribute('data-state', 'valid');
  });

  it('turns to the error state over budget', () => {
    renderHeader(overBudgetBook);

    expect(screen.getByText('124 / 120')).toBeInTheDocument();
    expect(screen.getByText('4 over')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveAttribute('data-state', 'over');
  });

  it('links back to the mage picker', () => {
    renderHeader(smallBook);

    expect(screen.getByRole('link', { name: 'Change mage' })).toHaveAttribute('href', '/');
  });
});
