import { makeCard, wizard } from '@/core/rules/fixtures';
import type { Card } from '@/core/rules/types';
import { type CatalogFilters, EMPTY_FILTERS, filterCards } from './filterCards';

const LEVEL_TWO = 2;

const fireAttack = makeCard({
  id: 'fire-attack',
  name: 'Fireball',
  type: 'Attack',
  schools: [{ school: 'Fire', level: LEVEL_TWO }],
  expansion: 'Core Set',
});
const waterAttack = makeCard({
  id: 'water-attack',
  name: 'Geyser',
  type: 'Attack',
  schools: [{ school: 'Water', level: 1 }],
  expansion: 'Druid vs Necromancer',
});
const fireCreature = makeCard({
  id: 'fire-creature',
  name: 'Fire Imp',
  type: 'Creature',
  subtypes: ['Imp'],
  schools: [{ school: 'Fire', level: 1 }],
  expansion: 'Core Set',
});
const warlockOnly = makeCard({
  id: 'warlock-only',
  name: 'Hellfire',
  type: 'Attack',
  onlyFor: 'Warlock',
  schools: [{ school: 'Fire', level: 1 }],
});

const CARDS: Card[] = [fireAttack, waterAttack, fireCreature, warlockOnly];

const ids = (filters: Partial<CatalogFilters>) =>
  filterCards(CARDS, { ...EMPTY_FILTERS, ...filters }, wizard, 'Fire').map((card) => card.id);

describe('filterCards', () => {
  it('returns every legal card for empty filters', () => {
    expect(ids({})).toEqual(['fire-attack', 'water-attack', 'fire-creature']);
  });

  it('never returns a card the mage cannot use, even when it matches', () => {
    expect(ids({ query: 'hellfire' })).toEqual([]);
  });

  it('ORs values within a filter group', () => {
    expect(ids({ types: ['Attack', 'Creature'] })).toEqual([
      'fire-attack',
      'water-attack',
      'fire-creature',
    ]);
    expect(ids({ schools: ['Fire', 'Water'] })).toEqual([
      'fire-attack',
      'water-attack',
      'fire-creature',
    ]);
  });

  it('ANDs across filter groups', () => {
    expect(ids({ types: ['Attack'], schools: ['Fire'] })).toEqual(['fire-attack']);
  });

  it('filters by subtype, expansion and level', () => {
    expect(ids({ subtypes: ['Imp'] })).toEqual(['fire-creature']);
    expect(ids({ expansions: ['Druid vs Necromancer'] })).toEqual(['water-attack']);
    expect(ids({ levels: [LEVEL_TWO] })).toEqual(['fire-attack']);
  });

  it('combines the query with the other filters', () => {
    expect(ids({ query: 'fire', types: ['Creature'] })).toEqual(['fire-creature']);
  });
});
