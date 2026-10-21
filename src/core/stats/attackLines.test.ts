import { parseAttackLines } from "./attackLines";

describe("parseAttackLines", () => {
  it("reads a ranged attack with a damage type", () => {
    expect(
      parseAttackLines(
        "Ranged | Lightning | 5d6 | d12 6-7 = Daze, 8+ = Stun | Ethereal",
      ),
    ).toEqual([{ reach: "Ranged", damageType: "Lightning" }]);
  });

  it("reads a melee attack with no damage type as physical", () => {
    expect(parseAttackLines("Spiked Mace\nQuick | Melee | 5d6")).toEqual([
      { reach: "Melee", damageType: "Physical" },
    ]);
  });

  it("reads a ranged attack with a range", () => {
    expect(parseAttackLines("Full | Ranged 1-2 | Flame | 4d6")).toEqual([
      { reach: "Ranged", damageType: "Flame" },
    ]);
  });

  it('reads "Range" as ranged, as Stormfront Elemental prints it', () => {
    expect(parseAttackLines("Full | Range 0-2| Lightning | 4d6")).toEqual([
      { reach: "Ranged", damageType: "Lightning" },
    ]);
  });

  it("gives a passage attack no reach", () => {
    expect(
      parseAttackLines(
        "Searing Flame\nPassage Attacks | Flame | 5d6 | d12 5-9 = Burn, 10+ = 2 Burn | Unavoidable, Defrost",
      ),
    ).toEqual([{ reach: null, damageType: "Flame" }]);
  });

  it("gives a bare attack no reach and physical damage", () => {
    expect(
      parseAttackLines(
        "Impaling Spikes\n4d6 | d12 1+ = Stuck | Unavoidable, Piercing +2",
      ),
    ).toEqual([{ reach: null, damageType: "Physical" }]);
  });

  it("reads nothing from an empty bar", () => {
    expect(parseAttackLines("")).toEqual([]);
  });
});
