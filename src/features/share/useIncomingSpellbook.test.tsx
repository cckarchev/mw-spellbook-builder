import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { readDraft } from '@/core/persistence/drafts';
import { toBase64Url } from '@/core/share-link/base64Url';
import { encodeSpellbook } from '@/core/share-link/spellbookCodec';
import { cardsById } from '@/data/catalog';
import {
  FIREBALL,
  overBudgetSpellbook,
  resetSpellbookStore,
  smallSpellbook,
} from '@/features/shared/testSpellbooks';
import { useSpellbookStore } from '@/store/useSpellbookStore';

const FIREBALL_CODE = cardsById.get(FIREBALL)?.code ?? '';
const OVER_LIMIT = 5;

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  resetSpellbookStore();
});

describe('opening a share link', () => {
  it('loads the spellbook and shows it on the Spellbook tab', () => {
    renderAt(`/?b=${encodeSpellbook(smallSpellbook)}`);

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(screen.getByRole('tab', { name: 'Spellbook' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('loads what it can and lists the problems', async () => {
    const wire = { v: 1, m: 'wizard', s: 'Fire', c: { deadbeef: 1, [FIREBALL_CODE]: OVER_LIMIT } };

    renderAt(`/?b=${toBase64Url(JSON.stringify(wire))}`);

    expect(useSpellbookStore.getState().spellbook.counts).toEqual({ [FIREBALL]: OVER_LIMIT });

    const dialog = screen.getByRole('dialog', { name: 'Check this spellbook' });

    expect(
      within(dialog).getByText('1 card in the link is not in the catalog and was left out'),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Fireball: 5 copies, max 4')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the current spellbook when the link cannot be read', () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);

    renderAt('/?b=not-a-spellbook');

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(screen.getByRole('dialog', { name: 'Check this spellbook' })).toHaveTextContent(
      'This link could not be read',
    );
  });

  it('names an unknown mage and still reports the cards left out', () => {
    const wire = { v: 1, m: 'archmage', c: { deadbeef: 1 } };

    renderAt(`/wizard?b=${toBase64Url(JSON.stringify(wire))}`);

    const dialog = screen.getByRole('dialog', { name: 'Check this spellbook' });

    expect(dialog).toHaveTextContent('The mage in this link (archmage) is not in the catalog.');
    expect(dialog).toHaveTextContent('1 card in the link is not in the catalog and was left out');
    expect(screen.getByRole('heading', { name: 'Choose a mage' })).toBeInTheDocument();
  });
});

describe('opening a share link over a spellbook in progress', () => {
  beforeEach(() => {
    useSpellbookStore.getState().loadSpellbook(overBudgetSpellbook);
  });

  it('asks before replacing it, and Cancel keeps it', async () => {
    renderAt(`/wizard?b=${encodeSpellbook(smallSpellbook)}`);

    const dialog = screen.getByRole('dialog', { name: 'Replace your spellbook?' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(overBudgetSpellbook);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('replaces it when confirmed', async () => {
    renderAt(`/wizard?b=${encodeSpellbook(smallSpellbook)}`);

    await userEvent.click(screen.getByRole('button', { name: 'Replace' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(screen.getByRole('tab', { name: 'Spellbook' })).toHaveAttribute('aria-selected', 'true');
  });

  it("asks about the link mage's draft even while another mage is open", async () => {
    const warlockSpellbook = { mageId: 'warlock', counts: { [FIREBALL]: 1 } };

    useSpellbookStore.getState().loadSpellbook(warlockSpellbook);
    renderAt(`/wizard?b=${encodeSpellbook(smallSpellbook)}`);

    const dialog = screen.getByRole('dialog', { name: 'Replace your spellbook?' });

    expect(dialog).toHaveTextContent(
      'This link opens another spellbook. Your Wizard spellbook will be replaced. To keep it, cancel and save it first.',
    );

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useSpellbookStore.getState().spellbook).toEqual(warlockSpellbook);
    expect(readDraft('wizard')?.spellbook).toEqual(overBudgetSpellbook);
  });

  it("does not ask when the link's mage has no draft, and keeps the open spellbook as its draft", () => {
    const warlockSpellbook = { mageId: 'warlock', counts: { [FIREBALL]: 1 } };

    resetSpellbookStore();
    useSpellbookStore.getState().loadSpellbook(warlockSpellbook);
    renderAt(`/wizard?b=${encodeSpellbook(smallSpellbook)}`);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(readDraft('warlock')?.spellbook).toEqual(warlockSpellbook);
  });

  it('does not ask when the draft is a saved spellbook with no changes', () => {
    useSpellbookStore.getState().save('Tourney');

    renderAt(`/wizard?b=${encodeSpellbook(smallSpellbook)}`);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
  });

  it('opens the same spellbook without asking', () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);

    renderAt(`/wizard?b=${encodeSpellbook(smallSpellbook)}`);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
