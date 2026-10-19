import { render, screen, within } from '@testing-library/react';
import { smallBook, wizard } from '@/features/shared/testBooks';
import { Spellbook } from './Spellbook';

const renderSpellbook = (book = smallBook) => {
  render(<Spellbook book={book} mage={wizard} onAdd={vi.fn()} onRemove={vi.fn()} />);
};

describe('Spellbook', () => {
  it('groups the book by type with a point subtotal per group', () => {
    renderSpellbook();

    // Copies per group, then the group subtotal.
    const attack = screen.getByRole('region', { name: 'Attack (5) 14 pts' });
    const conjuration = screen.getByRole('region', { name: 'Conjuration (2) 2 pts' });

    expect(within(attack).getByText('Fireball')).toBeInTheDocument();
    expect(within(attack).getByText('Lightning Bolt')).toBeInTheDocument();
    expect(within(conjuration).getByText('Mana Crystal')).toBeInTheDocument();
  });

  it('says when the book is empty', () => {
    renderSpellbook({ ...smallBook, counts: {} });

    expect(screen.getByText('No cards yet. Add some from the Cards tab.')).toBeInTheDocument();
  });
});
