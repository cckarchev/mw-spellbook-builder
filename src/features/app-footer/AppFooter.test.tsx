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

  it('opens the full notice from About, and the X closes it', async () => {
    render(<AppFooter />);

    await userEvent.click(screen.getByRole('button', { name: 'About' }));

    const dialog = screen.getByRole('dialog', { name: 'About this site' });

    expect(dialog).toHaveTextContent('not affiliated with, endorsed, sponsored or approved by');
    expect(dialog).toHaveTextContent('trademarks and copyrights of Arcane Wonders');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
