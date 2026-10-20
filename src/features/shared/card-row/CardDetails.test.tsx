import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cards } from '@/data/catalog';
import { CardDetails } from './CardDetails';

const findCard = (name: string) => {
  const card = cards.find((candidate) => candidate.name === name);

  if (!card) {
    throw new Error(`No card named ${name}`);
  }

  return card;
};

describe('CardDetails', () => {
  it('shows the card image full size in a dialog when the image is tapped', async () => {
    render(<CardDetails card={findCard('Arc Lightning')} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enlarge Arc Lightning' }));

    const dialog = screen.getByRole('dialog', { name: 'Arc Lightning' });

    expect(within(dialog).getByRole('img', { name: 'Arc Lightning' })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the target and the traits, with their terms tappable', () => {
    render(<CardDetails card={findCard('Force Golem')} />);

    expect(screen.getByText('Target').nextElementSibling).toHaveTextContent('Zone');
    expect(screen.getByText('Traits').nextElementSibling).toHaveTextContent(
      'Aegis 2, Nonliving, Dissipate 5, Forcemaster Only',
    );
    expect(screen.getByRole('button', { name: 'Aegis 2' })).toBeInTheDocument();
  });
});
