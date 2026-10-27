import { mageBadge } from "./mageBadge";

const SAVED_COUNT = 3;

describe("mageBadge", () => {
  it("counts the saved spellbooks", () => {
    expect(mageBadge(false, SAVED_COUNT)).toEqual({
      savedCount: 3,
      description: "3 saved spellbooks",
      hasDraft: false,
      hasSaved: true,
    });
  });

  it("says one saved spellbook in the singular", () => {
    expect(mageBadge(false, 1)?.description).toBe("1 saved spellbook");
  });

  it("marks a draft with no saved spellbooks", () => {
    expect(mageBadge(true, 0)).toEqual({
      savedCount: 0,
      description: "Draft",
      hasDraft: true,
      hasSaved: false,
    });
  });

  it("counts the saved spellbooks and tells the draft, the draft first", () => {
    expect(mageBadge(true, SAVED_COUNT)).toEqual({
      savedCount: 3,
      description: "Draft, 3 saved spellbooks",
      hasDraft: true,
      hasSaved: true,
    });
  });

  it("is null when the mage has neither", () => {
    expect(mageBadge(false, 0)).toBeNull();
  });
});
