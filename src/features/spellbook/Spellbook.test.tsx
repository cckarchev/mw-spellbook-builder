import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Book } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { cardsById } from '@/data/catalog';
import { FIREBALL, smallBook, tooManyCopiesBook, wizard } from '@/features/shared/testBooks';
import { Spellbook } from './Spellbook';

const ONE_FIREBALL: Book = { ...smallBook, counts: { ...smallBook.counts, [FIREBALL]: 1 } };

const renderSpellbook = (book: Book = smallBook) => {
  const onRemove = vi.fn();

  render(
    <Spellbook
      book={book}
      mage={wizard}
      summary={summarizeBook(book, wizard, cardsById)}
      onAdd={vi.fn()}
      onRemove={onRemove}
    />,
  );

  return { onRemove };
};

const removeOneFireball = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Remove one Fireball' }));
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

  it('removes a copy without asking while more copies stay', async () => {
    const { onRemove } = renderSpellbook();

    await removeOneFireball();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onRemove).toHaveBeenCalledWith(FIREBALL);
  });

  it('asks before removing the last copy, and Cancel keeps it', async () => {
    const { onRemove } = renderSpellbook(ONE_FIREBALL);

    await removeOneFireball();

    const dialog = screen.getByRole('dialog', { name: 'Remove Fireball?' });

    expect(dialog).toHaveTextContent('It is the last copy, so the card leaves the book.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('removes the last copy when confirmed', async () => {
    const { onRemove } = renderSpellbook(ONE_FIREBALL);

    await removeOneFireball();
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledWith(FIREBALL);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
