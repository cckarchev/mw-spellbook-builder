import { makeCard } from '@/core/rules/fixtures';
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
