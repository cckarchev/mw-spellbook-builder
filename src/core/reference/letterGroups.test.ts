import type { GlossaryEntry } from '@/core/glossary/types';
import { groupByLetter, letterOf, sortGlossary } from './letterGroups';

const entry = (term: string): GlossaryEntry => ({ term, definition: 'Something.' });

const aegis = entry('Aegis X');
const armor = entry('armor');
const echo = entry('Écho');
const vtar = entry('V’Tar Orb');

describe('letterGroups', () => {
  it('sorts ignoring case and accents, and groups by first letter', () => {
    const groups = groupByLetter(sortGlossary([vtar, armor, aegis]));

    expect(groups.map((group) => group.letter)).toEqual(['A', 'V']);
    expect(groups[0]?.entries).toEqual([aegis, armor]);
  });

  it('files a term under its letter without the accent', () => {
    expect(letterOf(echo.term)).toBe('E');
    expect(letterOf(vtar.term)).toBe('V');
  });

  it('does not change the list it sorts', () => {
    const entries = [vtar, aegis];

    sortGlossary(entries);

    expect(entries).toEqual([vtar, aegis]);
  });
});
