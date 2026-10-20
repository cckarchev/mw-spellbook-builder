import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppFooter } from './AppFooter';

describe('AppFooter', () => {
  it('always shows the short disclaimer', () => {
    render(<AppFooter />);

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'Unofficial fan project. Not affiliated with Arcane Wonders.',
    );
  });

  it('links to the official rulebook and rules supplement in a new tab', () => {
    render(<AppFooter />);

    const rulebook = screen.getByRole('link', { name: 'Rulebook' });
    const supplement = screen.getByRole('link', { name: 'Rules supplement' });

    expect(rulebook).toHaveAttribute(
      'href',
      'https://www.arcanewonders.com/wp-content/uploads/2021/05/Mage_Wars_Arena_Rulebook.pdf',
    );
    expect(supplement).toHaveAttribute(
      'href',
      'https://www.arcanewonders.com/wp-content/uploads/2021/05/Mage_Wars_Rules_Supplement.pdf',
    );

    for (const link of [rulebook, supplement]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('opens the full notice from About, and the X closes it', async () => {
    render(<AppFooter />);

    await userEvent.click(screen.getByRole('button', { name: 'About' }));

    const dialog = screen.getByRole('dialog', { name: 'About this site' });

    expect(dialog).toHaveTextContent('not affiliated with, endorsed, sponsored or approved by');
    expect(dialog).toHaveTextContent('trademarks and copyrights of Arcane Wonders');
    expect(dialog).toHaveTextContent('published by Arcane Wonders on its own site');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
