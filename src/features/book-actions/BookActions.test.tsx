import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { savedBooks } from '@/core/persistence/savedBooks';
import { resetBookStore, smallBook } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';
import { BookActions } from './BookActions';

const NAME = 'Tourney';

const savedNames = () => savedBooks('wizard').map(({ name }) => name);

const openSave = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  return screen.getByRole('dialog', { name: 'Save book' });
};

const saveAs = async (name: string) => {
  const dialog = await openSave();
  const input = within(dialog).getByRole('textbox', { name: 'Book name' });

  await userEvent.clear(input);

  if (name !== '') {
    await userEvent.type(input, name);
  }

  await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
};

beforeEach(() => {
  resetBookStore();
  useBookStore.getState().loadBook(smallBook);
});

describe('BookActions Save', () => {
  it('saves under a typed name and names the book', async () => {
    render(<BookActions />);

    await saveAs(NAME);

    expect(savedNames()).toEqual([NAME]);
    expect(useBookStore.getState().name).toBe(NAME);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts the field from the current name', async () => {
    useBookStore.getState().setName(NAME);
    render(<BookActions />);

    const dialog = await openSave();

    expect(within(dialog).getByRole('textbox', { name: 'Book name' })).toHaveValue(NAME);
  });

  it('trims spaces from the name', async () => {
    render(<BookActions />);

    await saveAs(`  ${NAME}  `);

    expect(savedNames()).toEqual([NAME]);
  });

  it('blocks an empty name', async () => {
    render(<BookActions />);

    await saveAs('   ');

    expect(savedNames()).toEqual([]);
    expect(screen.getByText('Enter a name for this book.')).toBeInTheDocument();
  });

  it('asks before replacing a saved book with the same name, and replaces it on confirm', async () => {
    render(<BookActions />);

    await saveAs(NAME);
    useBookStore.getState().loadBook({ mageId: 'wizard', counts: {} });
    await saveAs(NAME);

    const confirm = screen.getByRole('dialog', { name: `Overwrite "${NAME}"?` });

    await userEvent.click(within(confirm).getByRole('button', { name: 'Overwrite' }));

    expect(savedBooks('wizard')[0]?.book.counts).toEqual({});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the saved book when the overwrite is cancelled', async () => {
    render(<BookActions />);

    await saveAs(NAME);
    useBookStore.getState().loadBook({ mageId: 'wizard', counts: {} });
    await saveAs(NAME);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(savedBooks('wizard')[0]?.book).toEqual(smallBook);
  });
});
