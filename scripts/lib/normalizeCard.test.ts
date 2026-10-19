// biome-ignore-all lint/style/useNamingConvention: keys are OCTGN card property names.
import { normalizeCard } from './normalizeCard';
import type { RawCard } from './readModule';

const LEVEL_TWO = 2;
const CARD_ID = 'd8562a1d-6a95-4ca4-99aa-91c5ca769a33';

const makeRaw = (properties: Record<string, string>, name = 'Fireball'): RawCard => ({
  id: CARD_ID,
  name,
  properties: {
    Type: 'Attack',
    Subtype: 'Flame',
    School: 'Fire',
    Level: '2',
    Cost: '8',
    Action: 'Quick',
    Range: '0-2',
    Target: 'Creature or Conjuration',
    Traits: '',
    Effect: '',
    ...properties,
  },
});

describe('normalizeCard: what is a spell card', () => {
  it('maps a spell card to a catalog card', () => {
    const card = normalizeCard(makeRaw({}), 'arena', 'Core Set');

    expect(card).toMatchObject({
      id: CARD_ID,
      code: 'd8562a1d',
      name: 'Fireball',
      type: 'Attack',
      subtypes: ['Flame'],
      schoolMode: 'and',
      schools: [{ school: 'Fire', level: LEVEL_TWO }],
      format: 'arena',
      expansion: 'Core Set',
      manaCost: '8',
      action: 'Quick',
      range: '0-2',
      target: 'Creature or Conjuration',
      image: null,
    });
  });

  it('keeps the attack and ability bars', () => {
    const raw = makeRaw({ 'Attack Bar': 'Ranged | Flame | 6d6', 'Ability Bar': 'Force Pull' });

    expect(normalizeCard(raw, 'arena', undefined)).toMatchObject({
      attackBar: 'Ranged | Flame | 6d6',
      abilityBar: 'Force Pull',
    });
  });

  it.each(['Magestats', 'Internal', 'Phase', 'DiceRoll'])('drops %s entries', (type) => {
    expect(normalizeCard(makeRaw({ Type: type }), 'arena', undefined)).toBeNull();
  });

  it('drops mage cards by their Mage subtype', () => {
    const raw = makeRaw({ Type: 'Creature', Subtype: 'Mage, Human' });

    expect(normalizeCard(raw, 'arena', undefined)).toBeNull();
  });

  it('drops entries without a school, such as markers', () => {
    const raw = makeRaw({ Type: 'Conjuration', School: '', Level: '' });

    expect(normalizeCard(raw, 'arena', undefined)).toBeNull();
  });

  it('drops level 0 entries, such as the Paladin aura tokens', () => {
    const raw = makeRaw({ Type: 'Enchantment', School: 'Holy', Level: '0' }, 'Aura (Solar)');

    expect(normalizeCard(raw, 'arena', undefined)).toBeNull();
  });

  it.each(['Conjuration-Wall', 'Conjuration-Terrain', 'Conjuration-Terrrain'])(
    'reads %s as a Conjuration',
    (type) => {
      const card = normalizeCard(makeRaw({ Type: type }), 'arena', undefined);

      expect(card?.type).toBe('Conjuration');
    },
  );

  it('marks the expansion Unknown when it was not recovered', () => {
    expect(normalizeCard(makeRaw({}), 'academy', undefined)?.expansion).toBe('Unknown');
  });
});

describe('normalizeCard: schools and traits', () => {
  it('reads "+" schools as an "and" card with one level per part', () => {
    const card = normalizeCard(
      makeRaw({ School: 'Arcane+Dark', Level: '1+1' }),
      'arena',
      undefined,
    );

    expect(card?.schoolMode).toBe('and');
    expect(card?.schools).toEqual([
      { school: 'Arcane', level: 1 },
      { school: 'Dark', level: 1 },
    ]);
  });

  it('reads "/" schools as an "or" card', () => {
    const card = normalizeCard(makeRaw({ School: 'Air/Water', Level: '2/2' }), 'arena', undefined);

    expect(card?.schoolMode).toBe('or');
    expect(card?.schools).toEqual([
      { school: 'Air', level: LEVEL_TWO },
      { school: 'Water', level: LEVEL_TWO },
    ]);
  });

  it('drops a card whose levels do not match its schools', () => {
    const raw = makeRaw({ School: 'Air/Water', Level: '2' });

    expect(normalizeCard(raw, 'arena', undefined)).toBeNull();
  });

  it('splits traits on bullets and reads the "Only" trait', () => {
    const raw = makeRaw({ Traits: 'Cantrip • Unique • Warlord Only' });
    const card = normalizeCard(raw, 'arena', undefined);

    expect(card?.traits).toEqual(['Cantrip', 'Unique', 'Warlord Only']);
    expect(card?.onlyFor).toBe('Warlord');
  });

  it('reads a school "Only" trait', () => {
    const card = normalizeCard(makeRaw({ Traits: 'Epic • Holy Mage Only' }), 'arena', undefined);

    expect(card?.onlyFor).toBe('Holy Mage');
  });

  it('has no restriction and no traits when Traits is empty', () => {
    const card = normalizeCard(makeRaw({}), 'arena', undefined);

    expect(card?.traits).toEqual([]);
    expect(card?.onlyFor).toBeNull();
  });

  it('splits subtypes on commas', () => {
    const raw = makeRaw({ Type: 'Creature', Subtype: 'Animal, Canine' });

    expect(normalizeCard(raw, 'arena', undefined)?.subtypes).toEqual(['Animal', 'Canine']);
  });
});
