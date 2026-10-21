import type { Mage, School, Training } from "@/core/rules/types";

// Arena mages, hand-authored from each "<Name> Stats" card in the OCTGN module
// (MageSchoolFullTraining, MageSchoolOpposed, MageSchoolPartialTraining,
// MageSubtypeTraining, MageTypeOpposed, MageComboTraining). Apprentice variants are left out.

const ARENA_BUDGET = 120;
// Every arena stats card in the module prints Channeling=10.
const ARENA_CHANNELING = 10;
const DRUID_WATER_LEVEL = 1;
const PALADIN_MAX_LEVEL = 2;

const ELEMENTS: School[] = ["Air", "Earth", "Fire", "Water"];

interface MageEntry {
  id: string;
  name: string;
  /** Names an "X Only" card can match, besides the mage's own name. */
  className?: string[];
  imageCardId: string;
  statsCardId: string;
  training: Partial<Training>;
}

const arenaMage = (entry: MageEntry): Mage => {
  const ownName = [entry.name];
  const onlyNames = [...new Set([...(entry.className ?? []), ...ownName])];

  return {
    id: entry.id,
    name: entry.name,
    format: "arena",
    budget: ARENA_BUDGET,
    channeling: ARENA_CHANNELING,
    onlyNames,
    imageCardId: entry.imageCardId,
    statsCardId: entry.statsCardId,
    training: {
      full: [],
      opposed: [],
      partial: [],
      subtypes: [],
      opposedTypes: [],
      trainedCombos: [],
      ...entry.training,
    },
  };
};

const wizardTraining: Partial<Training> = { full: ["Arcane", "Air"] };
const warlockTraining: Partial<Training> = {
  full: ["Dark", "Fire"],
  opposed: ["Holy"],
};
const beastmasterTraining: Partial<Training> = {
  full: ["Nature"],
  opposed: ["Fire"],
};
const priestTraining: Partial<Training> = { full: ["Holy"], opposed: ["Dark"] };
const forcemasterTraining: Partial<Training> = {
  full: ["Mind"],
  opposedTypes: ["Creature"],
};
const warlordTraining: Partial<Training> = {
  full: ["War", "Earth"],
  opposed: ["Arcane"],
};

export const mages: Mage[] = [
  arenaMage({
    id: "wizard",
    name: "Wizard",
    imageCardId: "4208e1b0-b570-42de-9e62-5ce15b97b91e",
    statsCardId: "56ee2c14-3d58-4c08-a0c9-3c9bc85a765b",
    training: wizardTraining,
  }),
  arenaMage({
    id: "sistarran-wizard",
    name: "Sistarran Wizard",
    className: ["Wizard"],
    imageCardId: "11f1c87f-9858-4720-8383-358000f66fe5",
    statsCardId: "14c2b137-d796-4d7e-9982-9f156bc37ada",
    training: wizardTraining,
  }),
  arenaMage({
    id: "warlock",
    name: "Warlock",
    imageCardId: "2253ac7a-0146-4022-bd2e-4f5403ad8e1d",
    statsCardId: "52fdb62d-59e3-4b5e-904e-d92ae2be7012",
    training: warlockTraining,
  }),
  arenaMage({
    id: "adramelech-warlock",
    name: "Adramelech Warlock",
    className: ["Warlock"],
    imageCardId: "e7b094ae-8d94-4bda-81a5-73c11012ee52",
    statsCardId: "379871ba-a5ea-4cae-a5d1-95e59b6ecc78",
    training: warlockTraining,
  }),
  arenaMage({
    id: "beastmaster",
    name: "Beastmaster",
    imageCardId: "2b2ab8c5-65c0-4a49-8fab-e01e7d2c145f",
    statsCardId: "665fd551-678d-4b5c-94a3-347dd320f20a",
    training: beastmasterTraining,
  }),
  arenaMage({
    id: "johktari-beastmaster",
    name: "Johktari Beastmaster",
    className: ["Beastmaster"],
    imageCardId: "e0a0b790-fbfb-4a08-a12e-77e415134391",
    statsCardId: "f248612c-0328-4ca0-b9ec-f719da169cfc",
    training: beastmasterTraining,
  }),
  arenaMage({
    id: "priestess",
    name: "Priestess",
    imageCardId: "b5de32e7-8b57-44f2-a25a-b7bae56bffb7",
    statsCardId: "352e2f88-a99e-46f0-86f9-ab7b05d978cb",
    training: priestTraining,
  }),
  arenaMage({
    id: "priest",
    name: "Priest",
    className: ["Priestess"],
    imageCardId: "dcc4eb0b-a61f-4000-b873-7840fd0b0688",
    statsCardId: "ec7164f6-b2c3-4eb6-8416-70709eb83762",
    training: priestTraining,
  }),
  arenaMage({
    id: "druid",
    name: "Druid",
    imageCardId: "d20c9d4a-65a7-4018-bffc-16ed0cb62912",
    statsCardId: "df9efcd7-c4d2-4c8c-ac16-ea9eca1f5260",
    training: {
      full: ["Nature"],
      partial: [{ school: "Water", maxLevel: DRUID_WATER_LEVEL }],
      opposed: ["Fire", "War"],
    },
  }),
  arenaMage({
    id: "necromancer",
    name: "Necromancer",
    imageCardId: "6b830552-8420-4797-bbb5-3ec5bb768265",
    statsCardId: "682d3b40-7c08-437b-9c88-16e2f389773f",
    training: { full: ["Dark"], opposed: ["Holy"] },
  }),
  arenaMage({
    id: "forcemaster",
    name: "Forcemaster",
    imageCardId: "7f88625f-591b-41ef-861d-4a89a4a57f24",
    statsCardId: "6d6362dc-1130-4bd0-ae5b-55ae2c59bc82",
    training: forcemasterTraining,
  }),
  arenaMage({
    id: "salenia-forcemaster",
    name: "Salenia Forcemaster",
    className: ["Forcemaster"],
    imageCardId: "d3c7466b-2e15-436b-a6e8-799aa7132136",
    statsCardId: "720a045d-e808-4542-8be2-f1a3c3196080",
    training: forcemasterTraining,
  }),
  arenaMage({
    id: "warlord",
    name: "Warlord",
    imageCardId: "5cf0be26-ce65-405f-9c4a-312f31bceedb",
    statsCardId: "3b8c0ce6-8b89-4f40-b60a-a1530507ca4f",
    training: warlordTraining,
  }),
  arenaMage({
    id: "anvil-throne-warlord",
    name: "Anvil Throne Warlord",
    className: ["Warlord"],
    imageCardId: "b52ee3c1-ee9f-494c-8c45-55f2b1ff6313",
    statsCardId: "988facc7-debe-493b-95f0-95f0be0157cb",
    training: warlordTraining,
  }),
  arenaMage({
    id: "siren",
    name: "Siren",
    imageCardId: "97d362aa-8ea9-4000-a711-45d716b55a47",
    statsCardId: "f4ded825-e127-49ba-8f8e-ad105cf5a234",
    training: { full: ["Water"], subtypes: ["Pirate", "Song", "Aquatic"] },
  }),
  arenaMage({
    id: "paladin",
    name: "Paladin",
    imageCardId: "30a60bad-bf32-46a2-a69e-e949d288b7ac",
    statsCardId: "7dba45df-7c80-42a2-8cdc-2c02b170fd8c",
    training: {
      partial: [
        { school: "Holy", maxLevel: PALADIN_MAX_LEVEL },
        { school: "War", maxLevel: PALADIN_MAX_LEVEL },
      ],
      trainedCombos: [{ school: "Holy", type: "Creature" }],
      opposed: ["Dark"],
    },
  }),
  arenaMage({
    id: "elementalist",
    name: "Elementalist",
    imageCardId: "6d6d6058-2d93-4146-9661-84824315e18a",
    statsCardId: "6da10aed-ff62-45fa-80ec-454444c208f3",
    training: {
      full: ELEMENTS,
      opposed: ["War", "Nature", "Holy", "Arcane", "Dark", "Mind"],
    },
  }),
  arenaMage({
    id: "monk",
    name: "Monk",
    imageCardId: "16d22e1d-f763-40ca-9158-da704aafc43f",
    statsCardId: "9bdc5109-6652-4f84-9679-0343a756b843",
    training: {
      full: ["Mind"],
      subtypes: ["Martial", "Monk"],
      opposedTypes: ["Creature"],
    },
  }),
];
