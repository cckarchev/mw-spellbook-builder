import { cardCost, totalLevel } from './cardCost';
import {
  beastmaster,
  druid,
  forcemaster,
  makeCard,
  necromancer,
  paladin,
  siren,
  warlock,
  wizard,
} from './fixtures';

const TRAINED = 1;
const UNTRAINED = 2;
const OPPOSED = 3;

const LEVEL_TWO = 2;
const LEVEL_THREE = 3;
const LEVEL_FOUR = 4;

const airOrWater = makeCard({
  schoolMode: 'or',
  schools: [
    { school: 'Air', level: LEVEL_TWO },
    { school: 'Water', level: LEVEL_TWO },
  ],
});

describe('cardCost with school training', () => {
  const fireAttack = makeCard({ type: 'Attack', schools: [{ school: 'Fire', level: LEVEL_TWO }] });

  it('charges a trained chosen school once per level', () => {
    expect(cardCost(fireAttack, wizard, 'Fire')).toBe(LEVEL_TWO * TRAINED);
  });

  it('doubles an untrained school', () => {
    expect(cardCost(fireAttack, wizard, 'Air')).toBe(LEVEL_TWO * UNTRAINED);
  });

  it('triples an opposed school', () => {
    expect(cardCost(fireAttack, beastmaster, null)).toBe(LEVEL_TWO * OPPOSED);
  });

  it('charges a Novice card once per level', () => {
    const card = makeCard({ traits: ['Novice'], schools: [{ school: 'Nature', level: 1 }] });

    expect(cardCost(card, necromancer, null)).toBe(TRAINED);
  });

  it('still triples a Novice card in an opposed school', () => {
    const card = makeCard({ traits: ['Novice'], schools: [{ school: 'Holy', level: 1 }] });

    expect(cardCost(card, necromancer, null)).toBe(OPPOSED);
  });
});

describe('cardCost with special training', () => {
  it('treats partial training as trained up to its level', () => {
    const card = makeCard({ schools: [{ school: 'Water', level: 1 }] });

    expect(cardCost(card, druid, null)).toBe(TRAINED);
  });

  it('doubles partial training above its level', () => {
    const card = makeCard({ schools: [{ school: 'Water', level: LEVEL_TWO }] });

    expect(cardCost(card, druid, null)).toBe(LEVEL_TWO * UNTRAINED);
  });

  it('treats a trained school and type combo as trained', () => {
    const card = makeCard({ type: 'Creature', schools: [{ school: 'Holy', level: LEVEL_THREE }] });

    expect(cardCost(card, paladin, null)).toBe(LEVEL_THREE * TRAINED);
  });

  it('doubles a combo school outside its type above the partial level', () => {
    const card = makeCard({
      type: 'Incantation',
      schools: [{ school: 'Holy', level: LEVEL_FOUR }],
    });

    expect(cardCost(card, paladin, null)).toBe(LEVEL_FOUR * UNTRAINED);
  });

  it('charges a trained school once even for an opposed type', () => {
    const card = makeCard({ type: 'Creature', schools: [{ school: 'Mind', level: LEVEL_TWO }] });

    expect(cardCost(card, forcemaster, null)).toBe(LEVEL_TWO * TRAINED);
  });

  it('triples an opposed type in an untrained school', () => {
    const card = makeCard({ type: 'Creature', schools: [{ school: 'Nature', level: LEVEL_TWO }] });

    expect(cardCost(card, forcemaster, null)).toBe(LEVEL_TWO * OPPOSED);
  });

  it('doubles an untrained school of a type that is not opposed', () => {
    const card = makeCard({
      type: 'Incantation',
      schools: [{ school: 'Nature', level: LEVEL_TWO }],
    });

    expect(cardCost(card, forcemaster, null)).toBe(LEVEL_TWO * UNTRAINED);
  });

  it('treats a trained subtype as trained', () => {
    const card = makeCard({
      type: 'Creature',
      subtypes: ['Pirate'],
      schools: [{ school: 'Water', level: LEVEL_TWO }],
    });

    expect(cardCost(card, siren, null)).toBe(LEVEL_TWO * TRAINED);
  });

  it('treats a trained subtype in an untrained school as trained', () => {
    const card = makeCard({
      subtypes: ['Song'],
      schools: [{ school: 'Arcane', level: LEVEL_TWO }],
    });

    expect(cardCost(card, siren, null)).toBe(LEVEL_TWO * TRAINED);
  });
});

describe('cardCost with several schools', () => {
  it('sums every part of an "and" card', () => {
    const card = makeCard({
      schoolMode: 'and',
      schools: [
        { school: 'Arcane', level: 1 },
        { school: 'Dark', level: 1 },
      ],
    });

    expect(cardCost(card, warlock, null)).toBe(UNTRAINED + TRAINED);
  });

  it('charges the cheapest part of an "or" card', () => {
    expect(cardCost(airOrWater, wizard, 'Air')).toBe(LEVEL_TWO * TRAINED);
  });

  it('doubles an "or" card when no part is trained', () => {
    expect(cardCost(airOrWater, wizard, 'Fire')).toBe(LEVEL_TWO * UNTRAINED);
  });
});

describe('totalLevel', () => {
  it('sums the parts of an "and" card', () => {
    const card = makeCard({
      schoolMode: 'and',
      schools: [
        { school: 'Arcane', level: LEVEL_TWO },
        { school: 'Dark', level: 1 },
      ],
    });

    expect(totalLevel(card)).toBe(LEVEL_THREE);
  });

  it('takes the highest part of an "or" card', () => {
    expect(totalLevel(airOrWater)).toBe(LEVEL_TWO);
  });
});
