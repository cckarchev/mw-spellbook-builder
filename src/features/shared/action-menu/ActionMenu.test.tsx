import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionMenu, type ActionMenuItem } from './ActionMenu';

const renderMenu = () => {
  const user = userEvent.setup();
  const first = vi.fn();
  const second = vi.fn();
  const items: ActionMenuItem[] = [
    { label: 'First', icon: null, onSelect: first },
    { label: 'Second', icon: null, onSelect: second },
  ];

  render(
    <>
      <ActionMenu icon={null} label="Menu" items={items} />
      <p>Outside</p>
    </>,
  );

  return { user, first, second };
};

const trigger = () => screen.getByRole('button', { name: 'Menu' });

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(trigger());
};

describe('ActionMenu', () => {
  it('opens on its first item and picks one with Enter', async () => {
    const { user, second } = renderMenu();

    await openMenu(user);

    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(second).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('wraps the arrow keys around the ends', async () => {
    const { user } = renderMenu();

    await openMenu(user);
    await user.keyboard('{ArrowUp}');

    expect(screen.getByRole('menuitem', { name: 'Second' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus();
  });

  it('closes on Escape and gives the focus back to its button', async () => {
    const { user, first } = renderMenu();

    await openMenu(user);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    expect(first).not.toHaveBeenCalled();
  });

  it('closes on a tap outside', async () => {
    const { user } = renderMenu();

    await openMenu(user);
    await user.click(screen.getByText('Outside'));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes when its button is pressed again', async () => {
    const { user } = renderMenu();

    await openMenu(user);
    await openMenu(user);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
