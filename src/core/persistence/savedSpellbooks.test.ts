import { sameSpellbook } from '@/core/rules/spellbookChanges';
import type { Spellbook } from '@/core/rules/types';
import { encodeSpellbook } from '@/core/share-link/spellbookCodec';
import {
  deleteSavedSpellbook,
  loadSavedSpellbook,
  SAVED_PREFIX,
  savedCopy,
  savedSpellbooks,
  saveSpellbook,
} from './savedSpellbooks';

const FIREBALL = 'd8562a1d-6a95-4ca4-99aa-91c5ca769a33';
const WIZARD_ID = 'wizard';
const WARLOCK_ID = 'warlock';
const NAME = 'Tourney';

const wizardSpellbook = (copies: number): Spellbook => ({
  mageId: WIZARD_ID,
  counts: { [FIREBALL]: copies },
});

const savedNames = (mageId: string) => savedSpellbooks(mageId).map(({ name }) => name);

beforeEach(() => {
  localStorage.clear();
});

describe('savedSpellbooks', () => {
  it('saveSpellbook then loadSavedSpellbook returns the spellbook', () => {
    saveSpellbook(NAME, wizardSpellbook(1));

    const loaded = loadSavedSpellbook(WIZARD_ID, NAME);

    expect(loaded && sameSpellbook(loaded, wizardSpellbook(1))).toBe(true);
  });

  it('loadSavedSpellbook is null for an unknown name', () => {
    expect(loadSavedSpellbook(WIZARD_ID, NAME)).toBeNull();
  });

  it('saveSpellbook under an existing name replaces it', () => {
    saveSpellbook(NAME, wizardSpellbook(1));
    saveSpellbook(NAME, wizardSpellbook(2));

    const spellbooks = savedSpellbooks(WIZARD_ID);

    expect(spellbooks).toHaveLength(1);
    expect(spellbooks[0]?.spellbook.counts[FIREBALL]).toBe(2);
  });

  it('sorts by name ignoring case', () => {
    saveSpellbook('gamma', wizardSpellbook(1));
    saveSpellbook('Beta', wizardSpellbook(1));
    saveSpellbook('alpha', wizardSpellbook(1));

    expect(savedNames(WIZARD_ID)).toEqual(['alpha', 'Beta', 'gamma']);
  });

  it('keeps the spellbooks of each mage apart', () => {
    saveSpellbook(NAME, wizardSpellbook(1));

    expect(savedNames(WARLOCK_ID)).toEqual([]);
  });

  it('saves, lists and loads names like __proto__ and constructor', () => {
    saveSpellbook('__proto__', wizardSpellbook(1));
    saveSpellbook('constructor', wizardSpellbook(2));

    expect(savedNames(WIZARD_ID)).toEqual(['__proto__', 'constructor']);
    expect(loadSavedSpellbook(WIZARD_ID, '__proto__')?.counts[FIREBALL]).toBe(1);
    expect(loadSavedSpellbook(WIZARD_ID, 'constructor')?.counts[FIREBALL]).toBe(2);
  });

  it('treats names as case sensitive', () => {
    saveSpellbook('Tourney', wizardSpellbook(1));
    saveSpellbook('tourney', wizardSpellbook(2));

    expect(savedNames(WIZARD_ID)).toHaveLength(2);
  });

  it('saveSpellbook of a spellbook with no mage stores nothing', () => {
    saveSpellbook(NAME, { mageId: null, counts: {} });

    expect(localStorage.length).toBe(0);
  });
});

describe('deleteSavedSpellbook', () => {
  it('removes one, and the key after the last', () => {
    saveSpellbook('one', wizardSpellbook(1));
    saveSpellbook('two', wizardSpellbook(1));

    deleteSavedSpellbook(WIZARD_ID, 'one');

    expect(savedNames(WIZARD_ID)).toEqual(['two']);

    deleteSavedSpellbook(WIZARD_ID, 'two');

    expect(localStorage.getItem(SAVED_PREFIX + WIZARD_ID)).toBeNull();
  });

  it('of an unknown name changes nothing', () => {
    saveSpellbook(NAME, wizardSpellbook(1));

    deleteSavedSpellbook(WIZARD_ID, 'other');

    expect(savedNames(WIZARD_ID)).toEqual([NAME]);
  });
});

describe('unreadable saved spellbooks', () => {
  it.each(['nope', '[]', 'null', '"text"'])('is empty when the stored value is %s', (stored) => {
    localStorage.setItem(SAVED_PREFIX + WIZARD_ID, stored);

    expect(savedSpellbooks(WIZARD_ID)).toEqual([]);
  });

  it('skips entries that do not decode or name another mage', () => {
    const warlockSpellbook: Spellbook = { mageId: WARLOCK_ID, counts: {} };
    const stored = {
      [NAME]: encodeSpellbook(wizardSpellbook(1)),
      broken: '!!!',
      other: encodeSpellbook(warlockSpellbook),
      number: 3,
    };

    localStorage.setItem(SAVED_PREFIX + WIZARD_ID, JSON.stringify(stored));

    expect(savedNames(WIZARD_ID)).toEqual([NAME]);
  });
});

describe('savedCopy', () => {
  it("is the saved spellbook with the spellbook's name", () => {
    saveSpellbook(NAME, wizardSpellbook(1));

    expect(savedCopy(wizardSpellbook(2), NAME)).toEqual(wizardSpellbook(1));
  });

  it('is null for a spellbook with no name', () => {
    saveSpellbook(NAME, wizardSpellbook(1));

    expect(savedCopy(wizardSpellbook(1), null)).toBeNull();
  });

  it('is null for a spellbook with no mage', () => {
    expect(savedCopy({ mageId: null, counts: {} }, NAME)).toBeNull();
  });

  it('is null when the saved spellbook is gone', () => {
    expect(savedCopy(wizardSpellbook(1), NAME)).toBeNull();
  });
});
