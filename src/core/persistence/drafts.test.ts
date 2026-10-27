import { sameSpellbook } from "@/core/rules/spellbookChanges";
import type { Spellbook } from "@/core/rules/types";
import { encodeSpellbook } from "@/core/share-link/spellbookCodec";
import { officialWizardSpellbook } from "@/data/fixtures";
import {
  CURRENT_MAGE_KEY,
  DRAFT_PREFIX,
  hasUnsavedDraft,
  LEGACY_SPELLBOOK_KEY,
  migrateLegacySpellbook,
  readCurrentMageId,
  readDraft,
  writeCurrentMageId,
  writeDraft,
} from "./drafts";
import { saveSpellbook } from "./savedSpellbooks";

const FIREBALL = "d8562a1d-6a95-4ca4-99aa-91c5ca769a33";
const WIZARD_ID = "wizard";
const WARLOCK_ID = "warlock";
const NAME = "Tourney";

const wizardSpellbook: Spellbook = {
  mageId: WIZARD_ID,
  counts: { [FIREBALL]: 1 },
};
const emptyWizardSpellbook: Spellbook = { mageId: WIZARD_ID, counts: {} };

const storedDraft = (mageId: string) =>
  localStorage.getItem(DRAFT_PREFIX + mageId);

beforeEach(() => {
  localStorage.clear();
});

describe("drafts", () => {
  it("writeDraft then readDraft returns the same spellbook and name", () => {
    writeDraft({ spellbook: wizardSpellbook, name: NAME });

    const draft = readDraft(WIZARD_ID);

    expect(draft && sameSpellbook(draft.spellbook, wizardSpellbook)).toBe(true);
    expect(draft?.name).toBe(NAME);
  });

  it("readDraft is null for a mage with nothing stored", () => {
    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it("readDraft is null when the stored value is not JSON", () => {
    localStorage.setItem(DRAFT_PREFIX + WIZARD_ID, "not json");

    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it("readDraft is null when its spellbook string does not decode", () => {
    localStorage.setItem(
      DRAFT_PREFIX + WIZARD_ID,
      JSON.stringify({ b: "!!!", n: null }),
    );

    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it("readDraft is null when the stored spellbook names another mage", () => {
    const warlockSpellbook: Spellbook = { mageId: WARLOCK_ID, counts: {} };

    localStorage.setItem(
      DRAFT_PREFIX + WIZARD_ID,
      JSON.stringify({ b: encodeSpellbook(warlockSpellbook), n: null }),
    );

    expect(readDraft(WIZARD_ID)).toBeNull();
  });

  it("writeDraft of an empty unnamed spellbook removes the key", () => {
    writeDraft({ spellbook: wizardSpellbook, name: null });
    writeDraft({ spellbook: emptyWizardSpellbook, name: null });

    expect(storedDraft(WIZARD_ID)).toBeNull();
  });

  it("writeDraft of an empty named spellbook keeps it", () => {
    writeDraft({ spellbook: emptyWizardSpellbook, name: NAME });

    expect(readDraft(WIZARD_ID)?.name).toBe(NAME);
  });

  it("writeDraft of a spellbook with no mage stores nothing", () => {
    writeDraft({ spellbook: { mageId: null, counts: {} }, name: NAME });

    expect(localStorage.length).toBe(0);
  });
});

describe("hasUnsavedDraft", () => {
  it("is false when the mage has no draft", () => {
    expect(hasUnsavedDraft(WIZARD_ID)).toBe(false);
  });

  it("is true for an unnamed draft with cards", () => {
    writeDraft({ spellbook: wizardSpellbook, name: null });

    expect(hasUnsavedDraft(WIZARD_ID)).toBe(true);
  });

  it("is false for a draft that matches its saved copy", () => {
    saveSpellbook(NAME, wizardSpellbook);
    writeDraft({ spellbook: wizardSpellbook, name: NAME });

    expect(hasUnsavedDraft(WIZARD_ID)).toBe(false);
  });

  it("is true for a draft that differs from its saved copy", () => {
    saveSpellbook(NAME, emptyWizardSpellbook);
    writeDraft({ spellbook: wizardSpellbook, name: NAME });

    expect(hasUnsavedDraft(WIZARD_ID)).toBe(true);
  });

  it("is false for an unnamed draft equal to the mage's official spellbook", () => {
    writeDraft({ spellbook: officialWizardSpellbook(), name: null });

    expect(hasUnsavedDraft(WIZARD_ID)).toBe(false);
  });
});

describe("current mage", () => {
  it("round-trips the current mage id", () => {
    writeCurrentMageId(WARLOCK_ID);

    expect(readCurrentMageId()).toBe(WARLOCK_ID);
  });

  it("is null when none is stored", () => {
    expect(readCurrentMageId()).toBeNull();
  });
});

describe("migrateLegacySpellbook", () => {
  it("moves the legacy spellbook into its mage's draft, makes that mage current and removes the legacy key", () => {
    localStorage.setItem(
      LEGACY_SPELLBOOK_KEY,
      encodeSpellbook(wizardSpellbook),
    );

    migrateLegacySpellbook();

    const draft = readDraft(WIZARD_ID);

    expect(draft && sameSpellbook(draft.spellbook, wizardSpellbook)).toBe(true);
    expect(draft?.name).toBeNull();
    expect(readCurrentMageId()).toBe(WIZARD_ID);
    expect(localStorage.getItem(LEGACY_SPELLBOOK_KEY)).toBeNull();
  });

  it("with garbage in the legacy key only removes it", () => {
    localStorage.setItem(LEGACY_SPELLBOOK_KEY, "garbage");

    migrateLegacySpellbook();

    expect(localStorage.length).toBe(0);
  });

  it("does nothing when there is no legacy key", () => {
    writeDraft({ spellbook: wizardSpellbook, name: NAME });

    const before = storedDraft(WIZARD_ID);

    migrateLegacySpellbook();

    expect(storedDraft(WIZARD_ID)).toBe(before);
    expect(localStorage.getItem(CURRENT_MAGE_KEY)).toBeNull();
  });
});
