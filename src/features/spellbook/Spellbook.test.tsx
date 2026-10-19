import { render, screen, within } from '@testing-library/react';
import type { Book } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { cardsById } from '@/data/catalog';
import { smallBook, tooManyCopiesBook, wizard } from '@/features/shared/testBooks';
import { Spellbook } from './Spellbook';

const renderSpellbook = (book: Book = smallBook) => {
  render(
    <Spellbook
      book={book}
      mage={wizard}
      summary={summarizeBook(book, wizard, cardsById)}
      onAdd={vi.fn()}
      onRemove={vi.fn()}
    />,
  );
};

describe('Spellbook', () => {
  it('groups the book by type with a point subtotal per group', () => {
    renderSpellbook();

    // Copies per group, then the group subtotal.
    const attack = screen.getByRole('region', { name: 'Attack (5) 16 pts' });
    const conjuration = screen.getByRole('region', { name: 'Conjuration (2) 2 pts' });

    expect(within(attack).getByText('Fireball')).toBeInTheDocument();
    expect(within(attack).getByText('Lightning Bolt')).toBeInTheDocument();
    expect(within(conjuration).getByText('Mana Crystal')).toBeInTheDocument();
  });

  it('lists the problems of the book', () => {
    renderSpellbook(tooManyCopiesBook);

    const problems = screen.getByRole('list', { name: 'Problems' });

    expect(within(problems).getByText('Fireball: 5 copies, max 4')).toBeInTheDocument();
  });

  it('marks the card row that has a problem', () => {
    renderSpellbook(tooManyCopiesBook);

    const row = screen.getByText('Too many copies: max 4').closest('li');

    expect(row).toHaveAttribute('data-problem', 'true');
    expect(within(row as HTMLElement).getByText('Fireball')).toBeInTheDocument();
  });

  it('shows no problem list for a legal book', () => {
    renderSpellbook();

    expect(screen.queryByRole('list', { name: 'Problems' })).not.toBeInTheDocument();
  });

  it('says when the book is empty', () => {
    renderSpellbook({ ...smallBook, counts: {} });

    expect(screen.getByText('No cards yet. Add some from the Cards tab.')).toBeInTheDocument();
  });
});
