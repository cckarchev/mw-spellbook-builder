import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

const renderDialog = () => {
  render(
    <>
      <button type="button">Behind</button>
      <Dialog open={true} title="Pick one" onClose={() => undefined}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>
    </>,
  );
};

describe('Dialog', () => {
  it('focuses its first button when it opens', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('keeps Tab inside the dialog, wrapping from the last button to the first', async () => {
    renderDialog();

    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('keeps Shift+Tab inside the dialog, wrapping from the first button to the last', async () => {
    renderDialog();

    await userEvent.tab({ shift: true });

    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });
});

describe('Dialog close button', () => {
  it('closes from the X in the corner and takes the focus first', async () => {
    const onClose = vi.fn();

    render(
      <Dialog open={true} title="Card" onClose={onClose} closeButton={true}>
        <button type="button">Inside</button>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Card' });
    const close = within(dialog).getByRole('button', { name: 'Close' });

    expect(close).toHaveFocus();

    await userEvent.click(close);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has no X by default', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Pick one' });

    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });
});
