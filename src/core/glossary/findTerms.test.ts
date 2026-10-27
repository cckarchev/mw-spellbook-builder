import { buildGlossaryIndex, splitByTerms } from "./findTerms";
import type { GlossaryEntry } from "./types";

const entry = (term: string): GlossaryEntry => ({
  term,
  definition: `${term} means something.`,
});

const aegis = entry("Aegis X");
const armor = entry("Armor");
const armorModifier = entry("Armor +/- X");
const bloodreaper = entry("Bloodreaper (Warlock)");
const creature = entry("Creature");
const lineOfSight = entry("Line of Sight (LoS)");
const melee = entry("Melee +X");
const meleeAttack = entry("Melee Attack");
const sirensCall = entry("Siren’s Call");
const stun = entry("Stun");
const tough = entry("Tough -X");
const unavoidable = entry("Unavoidable");

const index = buildGlossaryIndex([
  aegis,
  armor,
  armorModifier,
  bloodreaper,
  creature,
  lineOfSight,
  melee,
  meleeAttack,
  sirensCall,
  stun,
  tough,
  unavoidable,
]);

/**
 * The matched words and the terms they point at, leaving out the plain text
 * between them.
 */
const matches = (text: string) =>
  splitByTerms(text, index).flatMap((segment) =>
    segment.entry ? [[segment.text, segment.entry.term]] : [],
  );

describe("splitByTerms", () => {
  it("splits a text into plain parts and glossary terms, keeping every character", () => {
    const text = "d12 9+ = Stun | Unavoidable";
    const segments = splitByTerms(text, index);

    expect(segments).toEqual([
      { text: "d12 9+ = ", entry: null },
      { text: "Stun", entry: stun },
      { text: " | ", entry: null },
      { text: "Unavoidable", entry: unavoidable },
    ]);
  });

  it("returns the whole text as one plain part when nothing matches", () => {
    expect(splitByTerms("Ranged | 3d6", index)).toEqual([
      { text: "Ranged | 3d6", entry: null },
    ]);
  });

  it("ignores case and a plural s", () => {
    expect(matches("target creatures and a stunned one")).toEqual([
      ["creatures", "Creature"],
    ]);
  });

  it("matches a term with X at any value", () => {
    expect(matches("Aegis 2, Melee +1, Tough -3, Regenerate X")).toEqual([
      ["Aegis 2", "Aegis X"],
      ["Melee +1", "Melee +X"],
      ["Tough -3", "Tough -X"],
    ]);
  });

  it("matches an X term with a literal X", () => {
    expect(matches("Melee +X")).toEqual([["Melee +X", "Melee +X"]]);
  });

  it("needs the number for an X term, so a plain word goes to its own entry", () => {
    expect(matches("Armor +2 and no Armor")).toEqual([
      ["Armor +2", "Armor +/- X"],
      ["Armor", "Armor"],
    ]);
  });

  it("prefers the longest term", () => {
    expect(matches("a Melee Attack")).toEqual([
      ["Melee Attack", "Melee Attack"],
    ]);
  });

  it("only matches whole words", () => {
    expect(matches("Stunning Armory")).toEqual([]);
  });

  it("leaves out the mage in parentheses", () => {
    expect(matches("his Bloodreaper heals")).toEqual([
      ["Bloodreaper", "Bloodreaper (Warlock)"],
    ]);
  });

  it("matches a short form in parentheses on its own too", () => {
    expect(matches("Line of Sight, or LoS")).toEqual([
      ["Line of Sight", "Line of Sight (LoS)"],
      ["LoS", "Line of Sight (LoS)"],
    ]);
  });

  it("matches a straight apostrophe for a curly one", () => {
    expect(matches("the Siren's Call")).toEqual([
      ["Siren's Call", "Siren’s Call"],
    ]);
  });

  it("keeps the first entry when a term repeats", () => {
    const repeated = buildGlossaryIndex([
      stun,
      { term: "Stun", definition: "Another." },
    ]);
    const [segment] = splitByTerms("Stun", repeated);

    expect(segment?.entry).toBe(stun);
  });
});

describe("splitByTerms with index options", () => {
  it("matches extra names given for a term", () => {
    const immunity = entry("Immunity");
    const damageType = entry("Damage Type +/- X");
    const aliased = buildGlossaryIndex([immunity, damageType], {
      aliases: {
        [immunity.term]: ["Hydro Immunity"],
        [damageType.term]: ["Flame +X"],
      },
    });
    const found = splitByTerms(
      "Flame +2, Hydro Immunity, Immunity",
      aliased,
    ).flatMap((segment) =>
      segment.entry ? [[segment.text, segment.entry.term]] : [],
    );

    expect(found).toEqual([
      ["Flame +2", "Damage Type +/- X"],
      ["Hydro Immunity", "Immunity"],
      ["Immunity", "Immunity"],
    ]);
  });

  it("matches a capitalized-only term only when it starts with a capital", () => {
    const attack = entry("Attack");
    const capitalized = buildGlossaryIndex([attack], {
      capitalizedOnly: ["Attack"],
    });
    const segments = splitByTerms("It attacks with an Attack", capitalized);

    expect(segments).toEqual([
      { text: "It attacks with an ", entry: null },
      { text: "Attack", entry: attack },
    ]);
  });
});
