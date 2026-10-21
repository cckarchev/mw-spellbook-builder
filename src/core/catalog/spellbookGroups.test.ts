import { makeCard, wizard } from "@/core/rules/fixtures";
import type { Card, Spellbook } from "@/core/rules/types";
import { spellbookGroups } from "./spellbookGroups";

const LEVEL_TWO = 2;
const FIREBALL_COPIES = 3;
const BOLT_COPIES = 2;
const CRYSTAL_COPIES = 2;

// Wizard (Arcane, Air): Fireball (untrained Fire) 3 x 4, Lightning Bolt 2 x 2, Mana Crystal 2 x 1.
const FIREBALL_POINTS = 12;
const ATTACK_POINTS = 16;
const CONJURATION_POINTS = 2;
const ATTACK_COPIES = 5;

const fireball = makeCard({
  id: "fireball",
  name: "Fireball",
  type: "Attack",
  schools: [{ school: "Fire", level: LEVEL_TWO }],
});
const lightningBolt = makeCard({
  id: "lightning-bolt",
  name: "Lightning Bolt",
  type: "Attack",
  schools: [{ school: "Air", level: LEVEL_TWO }],
});
const manaCrystal = makeCard({
  id: "mana-crystal",
  name: "Mana Crystal",
  type: "Conjuration",
});

const cardsById: ReadonlyMap<string, Card> = new Map(
  [fireball, lightningBolt, manaCrystal].map((card) => [card.id, card]),
);

const spellbook: Spellbook = {
  mageId: wizard.id,
  counts: {
    "mana-crystal": CRYSTAL_COPIES,
    "lightning-bolt": BOLT_COPIES,
    fireball: FIREBALL_COPIES,
    unknown: 1,
  },
};

describe("spellbookGroups", () => {
  it("groups the spellbook by type with names sorted, skipping unknown cards", () => {
    const groups = spellbookGroups(spellbook, wizard, cardsById);
    const names = groups.map((group) => [
      group.type,
      group.entries.map((entry) => entry.card.name),
    ]);

    expect(names).toEqual([
      ["Attack", ["Fireball", "Lightning Bolt"]],
      ["Conjuration", ["Mana Crystal"]],
    ]);
  });

  it("gives each entry its count and points, and each group its copies and subtotal", () => {
    const [attack, conjuration] = spellbookGroups(spellbook, wizard, cardsById);

    expect(attack?.entries[0]).toMatchObject({
      count: FIREBALL_COPIES,
      points: FIREBALL_POINTS,
    });
    expect(attack?.points).toBe(ATTACK_POINTS);
    expect(attack?.copies).toBe(ATTACK_COPIES);
    expect(conjuration?.points).toBe(CONJURATION_POINTS);
  });
});
