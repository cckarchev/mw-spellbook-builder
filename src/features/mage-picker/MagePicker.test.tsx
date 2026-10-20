import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { readDraft, writeDraft } from '@/core/persistence/drafts';
import { saveSpellbook } from '@/core/persistence/savedSpellbooks';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { FIREBALL, resetSpellbookStore, smallSpellbook } from '@/features/shared/testSpellbooks';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { MagePicker } from './MagePicker';

/** A "Warlock Only" card, illegal for every other mage. */
const ADRAMELECHS_TORMENT = '9e7cbef4-1ad9-46cf-95c0-1aafd656c85d';
const ONE_COPY = 1;

const renderPicker = () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route index={true} element={<MagePicker />} />
        <Route path=":mageSlug/*" element={<h1>Build screen</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

const buildScreen = () => screen.queryByRole('heading', { name: 'Build screen' });

const chooseWizard = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));
};

beforeEach(() => {
  resetSpellbookStore();
  useCatalogFiltersStore.getState().reset();
});

describe('MagePicker', () => {
  it('sets the mage and goes to the builder', async () => {
    renderPicker();

    await chooseWizard();

    expect(useSpellbookStore.getState().spellbook.mageId).toBe('wizard');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(buildScreen()).toBeInTheDocument();
  });

  it('keeps the spellbook when the player picks the same mage again', async () => {
    useSpellbookStore
      .getState()
      .loadSpellbook({ mageId: 'wizard', counts: { [FIREBALL]: ONE_COPY } });
    renderPicker();

    await chooseWizard();

    expect(useSpellbookStore.getState().spellbook.counts).toEqual({ [FIREBALL]: ONE_COPY });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(buildScreen()).toBeInTheDocument();
  });
});

describe('MagePicker stats card', () => {
  it('shows the mage stats card without picking the mage', async () => {
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Wizard stats' }));

    const dialog = screen.getByRole('dialog', { name: 'Wizard stats' });

    expect(within(dialog).getByRole('img', { name: 'Wizard stats card' })).toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook.mageId).toBeNull();
    expect(buildScreen()).not.toBeInTheDocument();
  });

  it('closes the stats card', async () => {
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Wizard stats' }));
    const dialog = screen.getByRole('dialog', { name: 'Wizard stats' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('MagePicker switching to another mage', () => {
  beforeEach(() => {
    useSpellbookStore.getState().loadSpellbook({
      mageId: 'warlock',
      counts: { [ADRAMELECHS_TORMENT]: ONE_COPY },
    });
  });

  it('opens the other mage without asking and keeps the old spellbook as its draft', async () => {
    renderPicker();

    await chooseWizard();

    const warlockDraft = readDraft('warlock');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook).toEqual({ mageId: 'wizard', counts: {} });
    expect(warlockDraft?.spellbook.counts).toEqual({ [ADRAMELECHS_TORMENT]: ONE_COPY });
    expect(buildScreen()).toBeInTheDocument();
  });
});

const tile = (name: string) => screen.getByRole('button', { name });

const badge = (mageName: string) =>
  screen.queryByRole('button', { name: `Load a saved ${mageName} spellbook` });

const openWizardBadge = async () => {
  const badgeButton = badge('Wizard');

  if (!badgeButton) {
    throw new Error('No Wizard badge');
  }

  await userEvent.click(badgeButton);
};

describe('MagePicker badges', () => {
  it("tells each mage's draft and saved spellbooks", () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
    writeDraft({ spellbook: { mageId: 'priest', counts: { [FIREBALL]: ONE_COPY } }, name: null });
    saveSpellbook('One', { mageId: 'warlock', counts: {} });
    saveSpellbook('Two', { mageId: 'warlock', counts: {} });

    renderPicker();

    expect(tile('Wizard')).toHaveAccessibleDescription('Draft');
    expect(tile('Priest')).toHaveAccessibleDescription('Draft');
    expect(tile('Warlock')).toHaveAccessibleDescription('2 saved spellbooks');
    expect(tile('Druid')).toHaveAccessibleDescription('');
    expect(badge('Warlock')).toHaveTextContent('2');
    expect(badge('Wizard')).not.toBeInTheDocument();
  });

  it('does not count a saved spellbook with no changes as a draft', () => {
    saveSpellbook('Tourney', smallSpellbook);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook, 'Tourney');

    renderPicker();

    expect(tile('Wizard')).toHaveAccessibleDescription('1 saved spellbook');
  });
});

describe('MagePicker loading from a badge', () => {
  it('continues the draft from the badge of a mage with no saved spellbooks', async () => {
    const draft = { mageId: 'priest', counts: { [FIREBALL]: ONE_COPY } };

    writeDraft({ spellbook: draft, name: null });

    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Continue the Priest draft' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(draft);
    expect(buildScreen()).toBeInTheDocument();
  });

  it('loads a saved spellbook from the badge and opens it', async () => {
    saveSpellbook('Tourney', smallSpellbook);

    renderPicker();

    await openWizardBadge();

    const dialog = screen.getByRole('dialog', { name: 'Saved Wizard spellbooks' });

    expect(within(dialog).queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: /Tourney/ }));

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(useSpellbookStore.getState().name).toBe('Tourney');
    expect(buildScreen()).toBeInTheDocument();
  });

  it('asks before replacing a draft with unsaved work, and keeps it on cancel', async () => {
    const draft = { mageId: 'wizard', counts: { [FIREBALL]: ONE_COPY } };

    saveSpellbook('Tourney', smallSpellbook);
    useSpellbookStore.getState().loadSpellbook(draft);

    renderPicker();

    await openWizardBadge();
    await userEvent.click(screen.getByRole('button', { name: /Tourney/ }));

    const confirm = screen.getByRole('dialog', { name: 'Replace your Wizard draft?' });

    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(draft);
    expect(screen.getByRole('dialog', { name: 'Saved Wizard spellbooks' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Tourney/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Replace' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(buildScreen()).toBeInTheDocument();
  });
});
