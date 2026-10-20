import { CURRENT_MAGE_KEY, DRAFT_PREFIX, LEGACY_SPELLBOOK_KEY } from '@/core/persistence/drafts';
import { loadSavedSpellbook } from '@/core/persistence/savedSpellbooks';
import type { Spellbook } from '@/core/rules/types';
import { canAddCopy } from '@/core/rules/validateSpellbook';
import { encodeSpellbook } from '@/core/share-link/spellbookCodec';
import { cards, magesById } from '@/data/catalog';
import { createSpellbookStore } from './useSpellbookStore';

const WIZARD_ID = 'wizard';
const WARLOCK_ID = 'warlock';
const NAME = 'Tourney';
const ADD_ATTEMPTS = 10;
const LOADED_COPIES = 2;

const EMPTY_SPELLBOOK: Spellbook = { mageId: null, counts: {} };

const findCard = (onlyFor: string | null) => {
  const card = cards.find((candidate) => candidate.onlyFor === onlyFor);

  if (!card) {
    throw new Error(`No card with onlyFor ${onlyFor}`);
  }

  return card;
};

const anyMageCard = findCard(null);

const createWizardStore = () => {
  const store = createSpellbookStore();

  store.getState().loadSpellbook({ mageId: WIZARD_ID, counts: {} });

  return store;
};

beforeEach(() => {
  localStorage.clear();
});

describe('useSpellbookStore copies', () => {
  it('adds copies until canAddCopy is false, then ignores addCopy', () => {
    const store = createWizardStore();
    const wizard = magesById.get(WIZARD_ID);

    for (let attempt = 0; attempt < ADD_ATTEMPTS; attempt++) {
      store.getState().addCopy(anyMageCard.id);
    }

    const { spellbook } = store.getState();
    const count = spellbook.counts[anyMageCard.id];

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(ADD_ATTEMPTS);
    expect(wizard && canAddCopy(spellbook, anyMageCard, wizard)).toBe(false);
  });

  it('ignores addCopy when no mage is chosen', () => {
    const store = createSpellbookStore();

    store.getState().addCopy(anyMageCard.id);

    expect(store.getState().spellbook.counts).toEqual({});
  });

  it('removeCopy at 1 deletes the key', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().removeCopy(anyMageCard.id);

    expect(store.getState().spellbook.counts).toEqual({});
  });
});

describe('useSpellbookStore spellbook changes', () => {
  it('starts empty', () => {
    expect(createSpellbookStore().getState().spellbook).toEqual(EMPTY_SPELLBOOK);
  });

  it('loadSpellbook replaces the spellbook and its name', () => {
    const store = createSpellbookStore();
    const loaded: Spellbook = {
      mageId: WIZARD_ID,
      counts: { [anyMageCard.id]: LOADED_COPIES },
    };

    store.getState().loadSpellbook(loaded, NAME);

    expect(store.getState().spellbook).toEqual(loaded);
    expect(store.getState().name).toBe(NAME);

    store.getState().loadSpellbook(loaded);

    expect(store.getState().name).toBeNull();
  });

  it('save stores the spellbook under the name, names it, and bumps the saved revision', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);

    const { spellbook, savedRevision } = store.getState();

    store.getState().save(NAME);

    expect(loadSavedSpellbook(WIZARD_ID, NAME)).toEqual(spellbook);
    expect(store.getState().name).toBe(NAME);
    expect(store.getState().savedRevision).toBe(savedRevision + 1);
  });

  it('save reports a failed write and leaves the name and saved revision alone', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);

    const { savedRevision } = store.getState();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    const saved = store.getState().save(NAME);

    vi.restoreAllMocks();

    expect(saved).toBe(false);
    expect(store.getState().name).toBeNull();
    expect(store.getState().savedRevision).toBe(savedRevision);
  });

  it('clear empties the spellbook, keeps the mage and drops the name', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().save(NAME);
    store.getState().clear();

    expect(store.getState().spellbook).toEqual({ mageId: WIZARD_ID, counts: {} });
    expect(store.getState().name).toBeNull();
  });
});

describe('useSpellbookStore openMage', () => {
  it("keeps the previous mage's spellbook as its draft and restores it on return", () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().save(NAME);

    const wizardSpellbook = store.getState().spellbook;

    store.getState().openMage(WARLOCK_ID);

    expect(store.getState().spellbook).toEqual({ mageId: WARLOCK_ID, counts: {} });
    expect(store.getState().name).toBeNull();

    store.getState().openMage(WIZARD_ID);

    expect(store.getState().spellbook).toEqual(wizardSpellbook);
    expect(store.getState().name).toBe(NAME);
  });

  it('keeps the spellbook when the mage is the same', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);

    const before = store.getState().spellbook;

    store.getState().openMage(WIZARD_ID);

    expect(store.getState().spellbook).toBe(before);
  });
});

describe('useSpellbookStore persistence', () => {
  it("survives a store re-create through the mage's draft", () => {
    const first = createWizardStore();

    first.getState().addCopy(anyMageCard.id);
    first.getState().save(NAME);

    const second = createSpellbookStore();

    expect(second.getState().spellbook).toEqual(first.getState().spellbook);
    expect(second.getState().name).toBe(NAME);
  });

  it('starts from the spellbook kept before there was a draft per mage', () => {
    const legacy: Spellbook = { mageId: WIZARD_ID, counts: { [anyMageCard.id]: 1 } };

    localStorage.setItem(LEGACY_SPELLBOOK_KEY, encodeSpellbook(legacy));

    expect(createSpellbookStore().getState().spellbook).toEqual(legacy);
  });

  it('starts empty when storage holds garbage', () => {
    localStorage.setItem(LEGACY_SPELLBOOK_KEY, 'not a spellbook');
    localStorage.setItem(CURRENT_MAGE_KEY, WIZARD_ID);
    localStorage.setItem(DRAFT_PREFIX + WIZARD_ID, 'not a draft');

    expect(createSpellbookStore().getState().spellbook).toEqual(EMPTY_SPELLBOOK);
  });
});
