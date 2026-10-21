import { makeCard } from "@/core/rules/fixtures";
import { filterOptions } from "./filterOptions";

const LEVEL_TWO = 2;
const LEVEL_THREE = 3;

const cards = [
  makeCard({
    type: "Incantation",
    subtypes: ["Mana"],
    schools: [{ school: "Water", level: LEVEL_THREE }],
    expansion: "Forcemaster vs Warlord",
  }),
  makeCard({
    type: "Attack",
    subtypes: ["Lightning", "Mana"],
    schools: [
      { school: "Air", level: 1 },
      { school: "Fire", level: 1 },
    ],
    expansion: "Core Set",
  }),
];

describe("filterOptions", () => {
  it("lists types in catalog order and schools in school order", () => {
    const options = filterOptions(cards);

    expect(options.types).toEqual(["Attack", "Incantation"]);
    expect(options.schools).toEqual(["Air", "Fire", "Water"]);
  });

  it("lists each subtype and expansion once, sorted", () => {
    const options = filterOptions(cards);

    expect(options.subtypes).toEqual(["Lightning", "Mana"]);
    expect(options.expansions).toEqual(["Core Set", "Forcemaster vs Warlord"]);
  });

  it("lists total levels in ascending order", () => {
    expect(filterOptions(cards).levels).toEqual([LEVEL_TWO, LEVEL_THREE]);
  });
});
