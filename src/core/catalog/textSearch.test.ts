import { makeCard } from '@/core/rules/fixtures';
import { cards } from '@/data/catalog';
import { matchesQuery } from './textSearch';

const fireball = makeCard({ name: 'Fireball', effect: 'Deals damage.' });
const firewall = makeCard({
  name: 'Wall of Flames',
  effect: 'Creatures that cross it catch fire.',
});
const dissolve = makeCard({ name: 'Dissolve', effect: 'Destroy target equipment.' });
const accented = makeCard({ name: 'Éter Bolt', effect: '' });
const manaCrystal = makeCard({ name: 'Mana Crystal', effect: 'Channeling +1.' });
const manaFlower = makeCard({ name: 'Mana Flower', effect: 'Gains mana.' });

const CARDS = [fireball, firewall, dissolve, accented, manaCrystal, manaFlower];

const search = (query: string) =>
  CARDS.filter((card) => matchesQuery(card, query)).map((card) => card.name);

describe('matchesQuery', () => {
  it('matches the name and the rules text', () => {
    expect(search('fire')).toEqual(['Fireball', 'Wall of Flames']);
  });

  it('ignores case', () => {
    expect(search('FIRE')).toEqual(search('fire'));
  });

  it('folds accents on both sides', () => {
    expect(search('eter')).toEqual(['Éter Bolt']);
    expect(search('ÉTER')).toEqual(['Éter Bolt']);
  });

  it('requires every word of a multi-word query', () => {
    expect(search('mana crystal')).toEqual(['Mana Crystal']);
    expect(search('crystal  mana')).toEqual(['Mana Crystal']);
  });

  it('matches everything for an empty or blank query', () => {
    expect(search('')).toHaveLength(CARDS.length);
    expect(search('   ')).toHaveLength(CARDS.length);
  });
});

describe('matchesQuery: the rest of the printed card', () => {
  it('matches the attack bar', () => {
    const card = makeCard({ attackBar: 'Ranged | Flame | 6d6 | d12 4-10 = Burn' });

    expect(matchesQuery(card, 'burn')).toBe(true);
  });

  it('matches the ability bar', () => {
    const card = makeCard({ abilityBar: 'Force Pull\nTarget creature is Pushed 1 zone.' });

    expect(matchesQuery(card, 'pushed')).toBe(true);
  });

  it('matches traits and subtypes', () => {
    const card = makeCard({ traits: ['Flying'], subtypes: ['Animal', 'Bird'] });

    expect(matchesQuery(card, 'flying')).toBe(true);
    expect(matchesQuery(card, 'bird')).toBe(true);
  });

  it('finds Fireball by its Burn effect in the real catalog', () => {
    const names = cards.filter((card) => matchesQuery(card, 'burn')).map((card) => card.name);

    expect(names).toContain('Fireball');
  });
});
