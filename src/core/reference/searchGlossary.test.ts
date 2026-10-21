import type { GlossaryEntry } from '@/core/glossary/types';
import { searchGlossary } from './searchGlossary';

const entry = (term: string, definition = 'Something.'): GlossaryEntry => ({ term, definition });

const afterburn = entry('Afterburn');
const burn = entry('Burn');
const flame = entry('Flame', 'Causes Burn.');
const armorX = entry('Armor +/- X');
const sirensCall = entry('Siren’s Call');

describe('searchGlossary', () => {
  it('puts names starting with the query before names containing it, then definitions', () => {
    expect(searchGlossary([afterburn, burn, flame], 'burn')).toEqual({
      byName: [burn, afterburn],
      byDefinition: [flame],
    });
  });

  it('matches regex characters literally', () => {
    expect(searchGlossary([armorX], '+/-').byName).toEqual([armorX]);
    expect(() => searchGlossary([armorX], '(')).not.toThrow();
  });

  it('finds a curly apostrophe from a straight one', () => {
    expect(searchGlossary([sirensCall], "siren's").byName).toEqual([sirensCall]);
  });

  it('finds nothing for no query', () => {
    expect(searchGlossary([burn], '')).toEqual({ byName: [], byDefinition: [] });
  });
});
