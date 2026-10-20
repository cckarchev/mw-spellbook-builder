import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useToastStore } from '@/components/toast/useToastStore';
import { savedSpellbooks, saveSpellbook } from '@/core/persistence/savedSpellbooks';
import { officialSpellbook } from '@/data/officialSpellbooks';
import { FIREBALL, resetSpellbookStore, smallSpellbook } from '@/features/shared/testSpellbooks';
import { useSpellbookStatus } from '@/store/useSpellbookStatus';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { SpellbookActions } from './SpellbookActions';

const NAME = 'Tourney';
const LOAD_TITLE = 'Load spellbook';

const EMPTY_WIZARD_SPELLBOOK = { mageId: 'wizard', counts: {} };
const OTHER_WIZARD_SPELLBOOK = { mageId: 'wizard', counts: { [FIREBALL]: 1 } };

const openLoad = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Load' }));

  return screen.getByRole('dialog', { name: LOAD_TITLE });
};

/** Shows whether the spellbook has unsaved changes, as the spellbook header reads it. */
const StatusProbe = () => {
  const { unsaved } = useSpellbookStatus();

  return <output aria-label="Status">{unsaved ? 'unsaved' : 'saved'}</output>;
};

const savedNames = () => savedSpellbooks('wizard').map(({ name }) => name);

const saveButton = () => screen.getByRole('button', { name: 'Save' });

const openSave = async () => {
  await userEvent.click(saveButton());

  return screen.getByRole('dialog', { name: 'Save spellbook' });
};

const saveAs = async (name: string) => {
  const dialog = await openSave();
  const input = within(dialog).getByRole('textbox', { name: 'Spellbook name' });

  await userEvent.clear(input);

  if (name !== '') {
    await userEvent.type(input, name);
  }

  await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
};

beforeEach(() => {
  resetSpellbookStore();
  useSpellbookStore.getState().loadSpellbook(smallSpellbook);
});

describe('SpellbookActions Save', () => {
  it('saves under a typed name and names the spellbook', async () => {
    render(<SpellbookActions />);

    await saveAs(NAME);

    expect(savedNames()).toEqual([NAME]);
    expect(useSpellbookStore.getState().name).toBe(NAME);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('says so when the browser will not store the spellbook, and leaves it unnamed', async () => {
    render(<SpellbookActions />);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    await saveAs(NAME);

    vi.restoreAllMocks();

    expect(useToastStore.getState().message).toMatch(/could not save/i);
    expect(useSpellbookStore.getState().name).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('starts the field from the current name', async () => {
    useSpellbookStore.getState().save(NAME);
    useSpellbookStore.getState().removeCopy(FIREBALL);
    render(<SpellbookActions />);

    const dialog = await openSave();

    expect(within(dialog).getByRole('textbox', { name: 'Spellbook name' })).toHaveValue(NAME);
  });

  it('trims spaces from the name', async () => {
    render(<SpellbookActions />);

    await saveAs(`  ${NAME}  `);

    expect(savedNames()).toEqual([NAME]);
  });

  it('blocks an empty name', async () => {
    render(<SpellbookActions />);

    await saveAs('   ');

    expect(savedNames()).toEqual([]);
    expect(screen.getByText('Enter a name for this spellbook.')).toBeInTheDocument();
  });

  it('is disabled for an empty spellbook', () => {
    useSpellbookStore.getState().loadSpellbook(EMPTY_WIZARD_SPELLBOOK);
    render(<SpellbookActions />);

    expect(saveButton()).toBeDisabled();
  });

  it('is disabled for a saved spellbook with no changes', () => {
    useSpellbookStore.getState().save(NAME);
    render(<SpellbookActions />);

    expect(saveButton()).toBeDisabled();
  });
});

describe('SpellbookActions Save over a saved name', () => {
  it('asks before replacing a saved spellbook with the same name, and replaces it on confirm', async () => {
    render(<SpellbookActions />);

    await saveAs(NAME);
    useSpellbookStore.getState().loadSpellbook(OTHER_WIZARD_SPELLBOOK);
    await saveAs(NAME);

    const confirm = screen.getByRole('dialog', { name: `Overwrite "${NAME}"?` });

    await userEvent.click(within(confirm).getByRole('button', { name: 'Overwrite' }));

    expect(savedSpellbooks('wizard')[0]?.spellbook).toEqual(OTHER_WIZARD_SPELLBOOK);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('saves changes to the loaded spellbook under its own name without asking', async () => {
    render(<SpellbookActions />);

    await saveAs(NAME);
    useSpellbookStore.getState().loadSpellbook(OTHER_WIZARD_SPELLBOOK, NAME);
    await saveAs(NAME);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(savedSpellbooks('wizard')[0]?.spellbook).toEqual(OTHER_WIZARD_SPELLBOOK);
  });

  it('shows the spellbook as saved again after saving its changes', async () => {
    render(
      <>
        <SpellbookActions />
        <StatusProbe />
      </>,
    );

    await saveAs(NAME);
    useSpellbookStore.getState().addCopy(FIREBALL);
    await saveAs(NAME);

    expect(screen.getByRole('status', { name: 'Status' })).toHaveTextContent('saved');
    expect(screen.getByRole('status', { name: 'Status' })).not.toHaveTextContent('unsaved');
  });

  it('keeps the saved spellbook when the overwrite is cancelled', async () => {
    render(<SpellbookActions />);

    await saveAs(NAME);
    useSpellbookStore.getState().loadSpellbook(OTHER_WIZARD_SPELLBOOK);
    await saveAs(NAME);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(savedSpellbooks('wizard')[0]?.spellbook).toEqual(smallSpellbook);
  });
});

describe('SpellbookActions Load', () => {
  it("lists this mage's saved spellbooks by name with their points", async () => {
    saveSpellbook('beta', smallSpellbook);
    saveSpellbook('Alpha', EMPTY_WIZARD_SPELLBOOK);
    saveSpellbook('Other mage', { mageId: 'warlock', counts: {} });
    render(<SpellbookActions />);

    const dialog = await openLoad();
    const savedSection = within(dialog).getByRole('region', { name: 'Saved' });
    const rows = within(savedSection).getAllByRole('button', { name: /pts$/ });

    expect(rows.map((row) => row.textContent)).toEqual(['Alpha0 pts', 'beta18 pts']);
  });

  it('says when there are no saved spellbooks', async () => {
    render(<SpellbookActions />);

    const dialog = await openLoad();

    expect(dialog).toHaveTextContent('No saved spellbooks for this mage yet.');
  });

  it('loads a spellbook right away when nothing would be lost', async () => {
    saveSpellbook(NAME, smallSpellbook);
    useSpellbookStore.getState().loadSpellbook(EMPTY_WIZARD_SPELLBOOK);
    render(<SpellbookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: /^Tourney/ }));

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(useSpellbookStore.getState().name).toBe(NAME);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks before replacing a spellbook with unsaved changes', async () => {
    saveSpellbook(NAME, EMPTY_WIZARD_SPELLBOOK);
    render(<SpellbookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: /^Tourney/ }));

    const confirm = screen.getByRole('dialog', { name: 'Replace current spellbook?' });

    expect(confirm).toHaveTextContent('Unsaved changes will be lost.');

    await userEvent.click(within(confirm).getByRole('button', { name: 'Replace' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(EMPTY_WIZARD_SPELLBOOK);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('SpellbookActions Load official', () => {
  const officialWizardSpellbook = () => {
    const official = officialSpellbook('wizard');

    if (official === null) {
      throw new Error('The Wizard has no official spellbook');
    }

    return official;
  };

  const officialRow = (dialog: HTMLElement) => {
    const officialSection = within(dialog).getByRole('region', { name: 'Official' });

    return within(officialSection).getByRole('button', { name: /^Official spellbook.*pts$/ });
  };

  it('shows the official spellbook first for a mage that has one', async () => {
    saveSpellbook(NAME, smallSpellbook);
    render(<SpellbookActions />);

    const dialog = await openLoad();
    const officialSection = within(dialog).getByRole('region', { name: 'Official' });
    const sections = within(dialog).getAllByRole('region');

    expect(sections.map((section) => section.getAttribute('aria-label'))).toEqual([
      'Official',
      'Saved',
    ]);
    expect(officialRow(dialog)).toBeInTheDocument();
    expect(
      within(officialSection).queryByRole('button', { name: /Delete/ }),
    ).not.toBeInTheDocument();
  });

  it('shows no official section for a mage without one', async () => {
    useSpellbookStore.getState().loadSpellbook({ mageId: 'sistarran-wizard', counts: {} });
    render(<SpellbookActions />);

    const dialog = await openLoad();

    expect(within(dialog).queryByRole('region', { name: 'Official' })).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent('No saved spellbooks for this mage yet.');
  });

  it('loads the official spellbook unnamed, after asking when unsaved changes would be lost', async () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook, null);
    render(<SpellbookActions />);

    const dialog = await openLoad();

    await userEvent.click(officialRow(dialog));

    const confirm = screen.getByRole('dialog', { name: 'Replace current spellbook?' });

    await userEvent.click(within(confirm).getByRole('button', { name: 'Replace' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(officialWizardSpellbook());
    expect(useSpellbookStore.getState().name).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('loads the official spellbook without asking when the current one is that official spellbook', async () => {
    useSpellbookStore.getState().loadSpellbook(officialWizardSpellbook(), null);
    render(
      <>
        <SpellbookActions />
        <StatusProbe />
      </>,
    );

    const dialog = await openLoad();

    await userEvent.click(officialRow(dialog));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook).toEqual(officialWizardSpellbook());
    expect(screen.getByRole('status', { name: 'Status' })).toHaveTextContent(/^saved$/);
  });
});

describe('SpellbookActions Delete', () => {
  it('deletes a saved spellbook after asking, and keeps the current spellbook', async () => {
    saveSpellbook(NAME, EMPTY_WIZARD_SPELLBOOK);
    render(<SpellbookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: `Delete ${NAME}` }));

    const confirm = screen.getByRole('dialog', { name: `Delete "${NAME}"?` });

    await userEvent.click(within(confirm).getByRole('button', { name: 'Delete' }));

    expect(savedNames()).toEqual([]);
    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(screen.getByRole('dialog', { name: LOAD_TITLE })).toHaveTextContent(
      'No saved spellbooks for this mage yet.',
    );
  });

  it('drops the name, and keeps the cards, when the loaded spellbook is deleted', async () => {
    saveSpellbook(NAME, smallSpellbook);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook, NAME);
    render(<SpellbookActions />);

    const dialog = await openLoad();

    await userEvent.click(within(dialog).getByRole('button', { name: `Delete ${NAME}` }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(useSpellbookStore.getState().name).toBeNull();
    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
  });
});

describe('SpellbookActions Clear', () => {
  const clearButton = () => screen.getByRole('button', { name: 'Clear' });

  it('asks before clearing unsaved cards, and keeps the mage and the saved spellbooks', async () => {
    saveSpellbook(NAME, EMPTY_WIZARD_SPELLBOOK);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook, NAME);
    render(<SpellbookActions />);

    await userEvent.click(clearButton());

    const confirm = screen.getByRole('dialog', { name: 'Clear this spellbook?' });

    expect(confirm).toHaveTextContent('Your Wizard spellbook has 7 cards. It will be cleared.');

    await userEvent.click(within(confirm).getByRole('button', { name: 'Clear' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(EMPTY_WIZARD_SPELLBOOK);
    expect(useSpellbookStore.getState().name).toBeNull();
    expect(savedNames()).toEqual([NAME]);
  });

  it('keeps the spellbook when the clear is cancelled', async () => {
    render(<SpellbookActions />);

    await userEvent.click(clearButton());
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
  });

  it('clears a saved spellbook with no changes without asking', async () => {
    saveSpellbook(NAME, smallSpellbook);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook, NAME);
    render(<SpellbookActions />);

    await userEvent.click(clearButton());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook).toEqual(EMPTY_WIZARD_SPELLBOOK);
    expect(savedNames()).toEqual([NAME]);
  });

  it('clears an empty named spellbook without asking', async () => {
    useSpellbookStore.getState().loadSpellbook(EMPTY_WIZARD_SPELLBOOK, NAME);
    render(<SpellbookActions />);

    await userEvent.click(clearButton());

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().name).toBeNull();
  });

  it('is disabled for an empty spellbook with no name', () => {
    useSpellbookStore.getState().loadSpellbook(EMPTY_WIZARD_SPELLBOOK);
    render(<SpellbookActions />);

    expect(clearButton()).toBeDisabled();
  });
});
