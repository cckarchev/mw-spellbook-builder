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

  it.each([
    ['Rulebook', 'Mage_Wars_Arena_Rulebook.pdf'],
    ['Codex', 'Mage_Wars_Arena_Codex3.1.pdf'],
    ['Rules supplement', 'Mage_Wars_Rules_Supplement.pdf'],
  ])('links to the official %s in a new tab', (name, file) => {
    render(<AppFooter />);

    const link = screen.getByRole('link', { name });

    expect(link).toHaveAttribute(
      'href',
      `https://www.arcanewonders.com/wp-content/uploads/2021/05/${file}`,
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the full notice from About, and the X closes it', async () => {
    render(<AppFooter />);

    await userEvent.click(screen.getByRole('button', { name: 'About' }));

    const dialog = screen.getByRole('dialog', { name: 'About this site' });

    expect(dialog).toHaveTextContent('not affiliated with, endorsed, sponsored or approved by');
    expect(dialog).toHaveTextContent('trademarks and copyrights of Arcane Wonders');
    expect(dialog).toHaveTextContent('published by Arcane Wonders on its own site');
    expect(within(dialog).getByRole('link', { name: 'Arcane Wonders' })).toHaveAttribute(
      'href',
      'https://www.arcanewonders.com/',
    );
    expect(within(dialog).getByRole('link', { name: 'Mage Wars Arena' })).toHaveAttribute(
      'href',
      'https://www.arcanewonders.com/product/mage-wars-arena/',
    );

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
