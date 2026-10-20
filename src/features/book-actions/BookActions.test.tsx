import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { saveBook, savedBooks } from '@/core/persistence/savedBooks';
import { resetBookStore, smallBook } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';
import { BookActions } from './BookActions';

const NAME = 'Tourney';

const EMPTY_WIZARD_BOOK = { mageId: 'wizard', counts: {} };

const openLoad = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Load' }));

  return screen.getByRole('dialog', { name: 'Saved books' });
};

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

describe('BookActions Load', () => {
  it("lists this mage's saved books by name with their points", async () => {
    saveBook('beta', smallBook);
    saveBook('Alpha', EMPTY_WIZARD_BOOK);
    saveBook('Other mage', { mageId: 'warlock', counts: {} });
    render(<BookActions />);

    const dialog = await openLoad();
    const rows = within(dialog).getAllByRole('button', { name: /pts$/ });

    expect(rows.map((row) => row.textContent)).toEqual(['Alpha0 pts', 'beta18 pts']);
  });

  it('says when there are no saved books', async () => {
    render(<BookActions />);

    const dialog = await openLoad();

    expect(dialog).toHaveTextContent('No saved books for this mage yet.');
  });

  it('loads a book right away when nothing would be lost', async () => {
    saveBook(NAME, smallBook);
    useBookStore.getState().loadBook(EMPTY_WIZARD_BOOK);
    render(<BookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: /^Tourney/ }));

    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(useBookStore.getState().name).toBe(NAME);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks before replacing a book with unsaved changes', async () => {
    saveBook(NAME, EMPTY_WIZARD_BOOK);
    render(<BookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: /^Tourney/ }));

    const confirm = screen.getByRole('dialog', { name: 'Replace current book?' });

    expect(confirm).toHaveTextContent('Unsaved changes will be lost.');

    await userEvent.click(within(confirm).getByRole('button', { name: 'Replace' }));

    expect(useBookStore.getState().book).toEqual(EMPTY_WIZARD_BOOK);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('BookActions Delete', () => {
  it('deletes a saved book after asking, and keeps the current book', async () => {
    saveBook(NAME, EMPTY_WIZARD_BOOK);
    render(<BookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: `Delete ${NAME}` }));

    const confirm = screen.getByRole('dialog', { name: `Delete "${NAME}"?` });

    await userEvent.click(within(confirm).getByRole('button', { name: 'Delete' }));

    expect(savedNames()).toEqual([]);
    expect(useBookStore.getState().book).toEqual(smallBook);
    expect(screen.getByRole('dialog', { name: 'Saved books' })).toHaveTextContent(
      'No saved books for this mage yet.',
    );
  });

  it('drops the name, and keeps the cards, when the loaded book is deleted', async () => {
    saveBook(NAME, smallBook);
    useBookStore.getState().loadBook(smallBook, NAME);
    render(<BookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: `Delete ${NAME}` }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(useBookStore.getState().name).toBeNull();
    expect(useBookStore.getState().book).toEqual(smallBook);
  });
});
