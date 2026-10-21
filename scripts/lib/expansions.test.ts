import { buildExpansionMap, expansionName } from "./expansions";

describe("expansionName", () => {
  it.each(["Core", "Mage Wars Arena Final Release"])(
    "maps %s to Core Set",
    (name) => {
      expect(expansionName(name)).toBe("Core Set");
    },
  );

  it("keeps other expansion names", () => {
    expect(expansionName("Conquest of Kumanjaro")).toBe(
      "Conquest of Kumanjaro",
    );
  });

  it("fixes the misspelled Lost Grimoire", () => {
    expect(expansionName("Lost Grimore")).toBe("Lost Grimoire");
  });

  it.each([
    "Playtest: Promo Errata - Mage Wars Community Project",
    "Gameboards",
  ])("drops %s", (name) => {
    expect(expansionName(name)).toBeNull();
  });
});

describe("buildExpansionMap", () => {
  it("maps each card id to its expansion", () => {
    const map = buildExpansionMap([
      { name: "Core", cardIds: ["a", "b"] },
      { name: "Forged in Fire", cardIds: ["c"] },
    ]);

    expect(map.get("a")).toBe("Core Set");
    expect(map.get("c")).toBe("Forged in Fire");
  });

  it("skips dropped sets", () => {
    const map = buildExpansionMap([{ name: "Gameboards", cardIds: ["a"] }]);

    expect(map.has("a")).toBe(false);
  });

  it("keeps the first expansion when a card appears in two sets", () => {
    const map = buildExpansionMap([
      { name: "Core", cardIds: ["a"] },
      { name: "Promo", cardIds: ["a"] },
    ]);

    expect(map.get("a")).toBe("Core Set");
  });
});
