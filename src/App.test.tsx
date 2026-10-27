import { act, cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readDraft } from "@/core/persistence/drafts";
import { sameSpellbook } from "@/core/rules/spellbookChanges";
import { FIREBALL, smallSpellbook } from "@/features/shared/testSpellbooks";
import { useSpellbookStore } from "@/store/useSpellbookStore";
import { renderAppAt, resetAppState } from "@/test/renderAppAt";
import { stubMatchMedia } from "@/test/stubMatchMedia";

beforeEach(() => {
  resetAppState();
});

describe("App", () => {
  it("opens on the mage picker", () => {
    renderAppAt("/");

    expect(
      screen.getByRole("heading", { name: "Choose a mage" }),
    ).toBeInTheDocument();
  });

  it("sends an unknown mage back to the mage picker", () => {
    renderAppAt("/not-a-mage");

    expect(
      screen.getByRole("heading", { name: "Choose a mage" }),
    ).toBeInTheDocument();
  });

  it("sends an unknown page under a mage back to the mage picker", () => {
    renderAppAt("/wizard/not-a-tab");

    expect(
      screen.getByRole("heading", { name: "Choose a mage" }),
    ).toBeInTheDocument();
  });
});

describe("App build screen", () => {
  beforeEach(() => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
  });

  it("opens the Spellbook tab at the mage spellbook path", () => {
    renderAppAt("/wizard/spellbook");

    expect(screen.getByRole("tab", { name: "Spellbook" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Mana Crystal");
  });

  it("switches tabs", async () => {
    renderAppAt("/wizard/spellbook");

    await userEvent.click(screen.getByRole("tab", { name: "Cards" }));

    expect(screen.getByRole("tab", { name: "Cards" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("searchbox", { name: "Search cards" }),
    ).toBeInTheDocument();
  });

  it("keeps the search when the player comes back from the Spellbook tab", async () => {
    renderAppAt("/wizard");

    // One paste instead of typing, so the catalog filters once and not per key.
    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search cards" }),
    );
    await userEvent.paste("fireball");
    await userEvent.click(screen.getByRole("tab", { name: "Spellbook" }));
    await userEvent.click(screen.getByRole("tab", { name: "Cards" }));

    expect(screen.getByRole("searchbox", { name: "Search cards" })).toHaveValue(
      "fireball",
    );
  });

  it("starts with no filters for another mage", async () => {
    renderAppAt("/wizard");

    // One paste instead of typing, so the catalog filters once and not per key.
    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search cards" }),
    );
    await userEvent.paste("fireball");
    cleanup();
    useSpellbookStore
      .getState()
      .loadSpellbook({ mageId: "priest", counts: {} });
    renderAppAt("/priest");

    expect(screen.getByRole("searchbox", { name: "Search cards" })).toHaveValue(
      "",
    );
  });
});

describe("App opened at another mage", () => {
  const currentMage = () => useSpellbookStore.getState().spellbook.mageId;

  it("switches right away when the spellbook has no cards", () => {
    useSpellbookStore
      .getState()
      .loadSpellbook({ mageId: "wizard", counts: {} });

    renderAppAt("/warlock");

    expect(currentMage()).toBe("warlock");
    expect(
      screen.getByRole("searchbox", { name: "Search cards" }),
    ).toBeInTheDocument();
  });

  it("opens the mage without asking and keeps the old spellbook as its draft", () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);

    renderAppAt("/warlock/spellbook");

    const wizardDraft = readDraft("wizard");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(currentMage()).toBe("warlock");
    expect(
      wizardDraft && sameSpellbook(wizardDraft.spellbook, smallSpellbook),
    ).toBe(true);
  });

  it("brings the old spellbook back on its mage URL", () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
    renderAppAt("/warlock");
    cleanup();

    renderAppAt("/wizard/spellbook");

    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Mana Crystal");
  });
});

const spellbookColumn = () =>
  screen.getByRole("complementary", { name: "Spellbook" });

/**
 * Runs every test of the calling describe on a desktop window, with the small
 * spellbook loaded.
 */
const onDesktop = () => {
  beforeEach(() => {
    stubMatchMedia(true);
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
};

describe("App build screen on desktop", () => {
  onDesktop();

  it("shows the catalog and the spellbook without the Cards tab", () => {
    renderAppAt("/wizard");

    expect(
      screen.queryByRole("tab", { name: "Cards" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search cards" }),
    ).toBeInTheDocument();
    expect(spellbookColumn()).toHaveTextContent("Mana Crystal");
  });

  it("shows the same screen at the spellbook path", () => {
    renderAppAt("/wizard/spellbook");

    expect(
      screen.queryByRole("tab", { name: "Cards" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search cards" }),
    ).toBeInTheDocument();
    expect(spellbookColumn()).toHaveTextContent("Mana Crystal");
  });

  it("goes back to tabs when the window narrows", () => {
    vi.unstubAllGlobals();
    const { setMatches } = stubMatchMedia(true);
    renderAppAt("/wizard");

    act(() => {
      setMatches(false);
    });

    expect(screen.getByRole("tab", { name: "Cards" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.queryByRole("complementary", { name: "Spellbook" }),
    ).not.toBeInTheDocument();
  });
});

describe("App build screen on desktop, editing from the catalog", () => {
  onDesktop();

  const catalogColumn = () => screen.getByRole("region", { name: "Catalog" });

  const searchCards = async (text: string) => {
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search cards" }),
      text,
    );
  };

  it("adds a card from the catalog to the spellbook column", async () => {
    renderAppAt("/wizard");

    await searchCards("dispel");
    await userEvent.click(
      within(catalogColumn()).getByRole("button", { name: "Add one Dispel" }),
    );

    expect(spellbookColumn()).toHaveTextContent("Dispel");
  });

  it("removes the last copy from the catalog without asking", async () => {
    useSpellbookStore
      .getState()
      .loadSpellbook({ ...smallSpellbook, counts: { [FIREBALL]: 1 } });
    renderAppAt("/wizard");

    await searchCards("fireball");
    await userEvent.click(
      within(catalogColumn()).getByRole("button", {
        name: "Remove one Fireball",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(spellbookColumn()).not.toHaveTextContent("Fireball");
  });
});
