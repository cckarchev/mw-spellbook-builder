import type { Mage, School, Training } from '@/core/rules/types';

// Arena mages, hand-authored from each "<Name> Stats" card in the OCTGN module
// (MageSchoolFullTraining, MageSchoolOpposed, MageSchoolPartialTraining,
// MageSubtypeTraining, MageTypeOpposed, MageComboTraining). Apprentice variants are left out.

const ARENA_BUDGET = 120;
const DRUID_WATER_LEVEL = 1;
const PALADIN_MAX_LEVEL = 2;

const ELEMENTS: School[] = ['Air', 'Earth', 'Fire', 'Water'];

interface MageEntry {
  id: string;
  name: string;
  /** Names an "X Only" card can match, besides the mage's own name. */
  className?: string[];
  imageCardId: string;
  training: Partial<Training>;
}

const arenaMage = (entry: MageEntry): Mage => {
  const ownName = [entry.name];
  const onlyNames = [...new Set([...(entry.className ?? []), ...ownName])];

  return {
    id: entry.id,
    name: entry.name,
    format: 'arena',
    budget: ARENA_BUDGET,
    onlyNames,
    imageCardId: entry.imageCardId,
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

const wizardTraining: Partial<Training> = { full: ['Arcane', 'Air'] };
const warlockTraining: Partial<Training> = { full: ['Dark', 'Fire'], opposed: ['Holy'] };
const beastmasterTraining: Partial<Training> = { full: ['Nature'], opposed: ['Fire'] };
const priestTraining: Partial<Training> = { full: ['Holy'], opposed: ['Dark'] };
const forcemasterTraining: Partial<Training> = { full: ['Mind'], opposedTypes: ['Creature'] };
const warlordTraining: Partial<Training> = { full: ['War', 'Earth'], opposed: ['Arcane'] };

export const mages: Mage[] = [
  arenaMage({
    id: 'wizard',
    name: 'Wizard',
    imageCardId: '4208e1b0-b570-42de-9e62-5ce15b97b91e',
    training: wizardTraining,
  }),
  arenaMage({
    id: 'sistarran-wizard',
    name: 'Sistarran Wizard',
    className: ['Wizard'],
    imageCardId: '11f1c87f-9858-4720-8383-358000f66fe5',
    training: wizardTraining,
  }),
  arenaMage({
    id: 'warlock',
    name: 'Warlock',
    imageCardId: '2253ac7a-0146-4022-bd2e-4f5403ad8e1d',
    training: warlockTraining,
  }),
  arenaMage({
    id: 'adramelech-warlock',
    name: 'Adramelech Warlock',
    className: ['Warlock'],
    imageCardId: 'e7b094ae-8d94-4bda-81a5-73c11012ee52',
    training: warlockTraining,
  }),
  arenaMage({
    id: 'beastmaster',
    name: 'Beastmaster',
    imageCardId: '2b2ab8c5-65c0-4a49-8fab-e01e7d2c145f',
    training: beastmasterTraining,
  }),
  arenaMage({
    id: 'johktari-beastmaster',
    name: 'Johktari Beastmaster',
    className: ['Beastmaster'],
    imageCardId: 'e0a0b790-fbfb-4a08-a12e-77e415134391',
    training: beastmasterTraining,
  }),
  arenaMage({
    id: 'priestess',
    name: 'Priestess',
    imageCardId: 'b5de32e7-8b57-44f2-a25a-b7bae56bffb7',
    training: priestTraining,
  }),
  arenaMage({
    id: 'priest',
    name: 'Priest',
    className: ['Priestess'],
    imageCardId: 'dcc4eb0b-a61f-4000-b873-7840fd0b0688',
    training: priestTraining,
  }),
  arenaMage({
    id: 'druid',
    name: 'Druid',
    imageCardId: 'd20c9d4a-65a7-4018-bffc-16ed0cb62912',
    training: {
      full: ['Nature'],
      partial: [{ school: 'Water', maxLevel: DRUID_WATER_LEVEL }],
      opposed: ['Fire', 'War'],
    },
  }),
  arenaMage({
    id: 'necromancer',
    name: 'Necromancer',
    imageCardId: '6b830552-8420-4797-bbb5-3ec5bb768265',
    training: { full: ['Dark'], opposed: ['Holy'] },
  }),
  arenaMage({
    id: 'forcemaster',
    name: 'Forcemaster',
    imageCardId: '7f88625f-591b-41ef-861d-4a89a4a57f24',
    training: forcemasterTraining,
  }),
  arenaMage({
    id: 'salenia-forcemaster',
    name: 'Salenia Forcemaster',
    className: ['Forcemaster'],
    imageCardId: 'd3c7466b-2e15-436b-a6e8-799aa7132136',
    training: forcemasterTraining,
  }),
  arenaMage({
    id: 'warlord',
    name: 'Warlord',
    imageCardId: '5cf0be26-ce65-405f-9c4a-312f31bceedb',
    training: warlordTraining,
  }),
  arenaMage({
    id: 'anvil-throne-warlord',
    name: 'Anvil Throne Warlord',
    className: ['Warlord'],
    imageCardId: 'b52ee3c1-ee9f-494c-8c45-55f2b1ff6313',
    training: warlordTraining,
  }),
  arenaMage({
    id: 'siren',
    name: 'Siren',
    imageCardId: '97d362aa-8ea9-4000-a711-45d716b55a47',
    training: { full: ['Water'], subtypes: ['Pirate', 'Song', 'Aquatic'] },
  }),
  arenaMage({
    id: 'paladin',
    name: 'Paladin',
    imageCardId: '30a60bad-bf32-46a2-a69e-e949d288b7ac',
    training: {
      partial: [
        { school: 'Holy', maxLevel: PALADIN_MAX_LEVEL },
        { school: 'War', maxLevel: PALADIN_MAX_LEVEL },
      ],
      trainedCombos: [{ school: 'Holy', type: 'Creature' }],
      opposed: ['Dark'],
    },
  }),
  arenaMage({
    id: 'elementalist',
    name: 'Elementalist',
    imageCardId: '6d6d6058-2d93-4146-9661-84824315e18a',
    training: {
      full: ELEMENTS,
      opposed: ['War', 'Nature', 'Holy', 'Arcane', 'Dark', 'Mind'],
    },
  }),
  arenaMage({
    id: 'monk',
    name: 'Monk',
    imageCardId: '16d22e1d-f763-40ca-9158-da704aafc43f',
    training: { full: ['Mind'], subtypes: ['Martial', 'Monk'], opposedTypes: ['Creature'] },
  }),
];
