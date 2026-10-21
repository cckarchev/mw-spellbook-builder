import type { Card, Mage, Training } from "./types";

// Test fixtures for the rules modules. Training values follow the OCTGN module.

const ARENA_BUDGET = 120;
const ARENA_CHANNELING = 10;

const emptyTraining = (): Training => ({
  full: [],
  opposed: [],
  partial: [],
  subtypes: [],
  opposedTypes: [],
  trainedCombos: [],
});

export const makeCard = (overrides: Partial<Card> = {}): Card => ({
  id: "card-id",
  code: "card0000",
  name: "Test Card",
  type: "Incantation",
  subtypes: [],
  schoolMode: "and",
  schools: [{ school: "Arcane", level: 1 }],
  traits: [],
  onlyFor: null,
  format: "arena",
  expansion: "Core Set",
  manaCost: "",
  action: "",
  range: "",
  target: "",
  effect: "",
  attackBar: "",
  abilityBar: "",
  image: null,
  landscape: false,
  ...overrides,
});

export const makeMage = (
  overrides: Partial<Omit<Mage, "training">> & {
    training?: Partial<Training>;
  } = {},
): Mage => {
  const { training, ...rest } = overrides;

  return {
    id: "mage-id",
    name: "Test Mage",
    format: "arena",
    budget: ARENA_BUDGET,
    channeling: ARENA_CHANNELING,
    onlyNames: [],
    imageCardId: null,
    statsCardId: null,
    ...rest,
    training: { ...emptyTraining(), ...training },
  };
};

export const wizard = makeMage({
  id: "wizard",
  name: "Wizard",
  onlyNames: ["Wizard"],
  training: { full: ["Arcane", "Air"] },
});

export const beastmaster = makeMage({
  id: "beastmaster",
  name: "Beastmaster",
  onlyNames: ["Beastmaster"],
  training: { full: ["Nature"], opposed: ["Fire"] },
});

export const necromancer = makeMage({
  id: "necromancer",
  name: "Necromancer",
  onlyNames: ["Necromancer"],
  training: { full: ["Dark"], opposed: ["Holy"] },
});

export const druid = makeMage({
  id: "druid",
  name: "Druid",
  onlyNames: ["Druid"],
  training: {
    full: ["Nature"],
    partial: [{ school: "Water", maxLevel: 1 }],
    opposed: ["Fire", "War"],
  },
});

export const paladin = makeMage({
  id: "paladin",
  name: "Paladin",
  onlyNames: ["Paladin"],
  training: {
    partial: [
      { school: "Holy", maxLevel: 2 },
      { school: "War", maxLevel: 2 },
    ],
    trainedCombos: [{ school: "Holy", type: "Creature" }],
    opposed: ["Dark"],
  },
});

export const forcemaster = makeMage({
  id: "forcemaster",
  name: "Forcemaster",
  onlyNames: ["Forcemaster"],
  training: { full: ["Mind"], opposedTypes: ["Creature"] },
});

export const siren = makeMage({
  id: "siren",
  name: "Siren",
  onlyNames: ["Siren"],
  training: { full: ["Water"], subtypes: ["Pirate", "Song", "Aquatic"] },
});

export const warlock = makeMage({
  id: "warlock",
  name: "Warlock",
  onlyNames: ["Warlock"],
  training: { full: ["Dark", "Fire"], opposed: ["Holy"] },
});

export const priest = makeMage({
  id: "priest",
  name: "Priest",
  onlyNames: ["Priest", "Priestess"],
  training: { full: ["Holy"], opposed: ["Dark"] },
});
