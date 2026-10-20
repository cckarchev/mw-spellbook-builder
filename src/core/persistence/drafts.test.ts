import { sameBook } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { encodeBook } from '@/core/share-link/bookCodec';
import {
  CURRENT_MAGE_KEY,
  DRAFT_PREFIX,
  LEGACY_BOOK_KEY,
  migrateLegacyBook,
  readCurrentMageId,
  readDraft,
  writeCurrentMageId,
  writeDraft,
} from './drafts';

const FIREBALL = 'd8562a1d-6a95-4ca4-99aa-91c5ca769a33';
const WIZARD_ID = 'wizard';
const WARLOCK_ID = 'warlock';
const NAME = 'Tourney';

const wizardBook: Book = { mageId: WIZARD_ID, counts: { [FIREBALL]: 1 } };
const emptyWizardBook: Book = { mageId: WIZARD_ID, counts: {} };

const storedDraft = (mageId: string) => localStorage.getItem(DRAFT_PREFIX + mageId);

beforeEach(() => {
  localStorage.clear();
});

describe('drafts', () => {
  it('writeDraft then readDraft returns the same book and name', () => {
    writeDraft({ book: wizardBook, name: NAME });

    const draft = readDraft(WIZARD_ID);

    expect(draft && sameBook(draft.book, wizardBook)).toBe(true);
    expect(draft?.name).toBe(NAME);
  });

  it('readDraft is null for a mage with nothing stored', () => {
    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it('readDraft is null when the stored value is not JSON', () => {
    localStorage.setItem(DRAFT_PREFIX + WIZARD_ID, 'not json');

    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it('readDraft is null when its book string does not decode', () => {
    localStorage.setItem(DRAFT_PREFIX + WIZARD_ID, JSON.stringify({ b: '!!!', n: null }));

    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it('readDraft is null when the stored book names another mage', () => {
    const warlockBook: Book = { mageId: WARLOCK_ID, counts: {} };

    localStorage.setItem(
      DRAFT_PREFIX + WIZARD_ID,
      JSON.stringify({ b: encodeBook(warlockBook), n: null }),
    );

    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it('writeDraft of an empty unnamed book removes the key', () => {
    writeDraft({ book: wizardBook, name: null });
    writeDraft({ book: emptyWizardBook, name: null });

    expect(storedDraft(WIZARD_ID)).toBeNull();
  });

  it('writeDraft of an empty named book keeps it', () => {
    writeDraft({ book: emptyWizardBook, name: NAME });

    expect(readDraft(WIZARD_ID)?.name).toBe(NAME);
  });

  it('writeDraft of a book with no mage stores nothing', () => {
    writeDraft({ book: { mageId: null, counts: {} }, name: NAME });

    expect(localStorage.length).toBe(0);
  });
});

describe('current mage', () => {
  it('round-trips the current mage id', () => {
    writeCurrentMageId(WARLOCK_ID);

    expect(readCurrentMageId()).toBe(WARLOCK_ID);
  });

  it('is null when none is stored', () => {
    expect(readCurrentMageId()).toBeNull();
  });
});

describe('migrateLegacyBook', () => {
  it("moves the legacy book into its mage's draft, makes that mage current and removes the legacy key", () => {
    localStorage.setItem(LEGACY_BOOK_KEY, encodeBook(wizardBook));

    migrateLegacyBook();

    const draft = readDraft(WIZARD_ID);

    expect(draft && sameBook(draft.book, wizardBook)).toBe(true);
    expect(draft?.name).toBeNull();
    expect(readCurrentMageId()).toBe(WIZARD_ID);
    expect(localStorage.getItem(LEGACY_BOOK_KEY)).toBeNull();
  });

  it('with garbage in the legacy key only removes it', () => {
    localStorage.setItem(LEGACY_BOOK_KEY, 'garbage');

    migrateLegacyBook();

    expect(localStorage.length).toBe(0);
  });

  it('does nothing when there is no legacy key', () => {
    writeDraft({ book: wizardBook, name: NAME });

    const before = storedDraft(WIZARD_ID);

    migrateLegacyBook();

    expect(storedDraft(WIZARD_ID)).toBe(before);
    expect(localStorage.getItem(CURRENT_MAGE_KEY)).toBeNull();
  });
});
