import { makeCard } from '@/core/rules/fixtures';
import { schoolSummary } from './schoolSummary';

const LEVEL_TWO = 2;

describe('schoolSummary', () => {
  it('shows one school with its level', () => {
    const card = makeCard({ schools: [{ school: 'Fire', level: LEVEL_TWO }] });

    expect(schoolSummary(card)).toBe('Fire 2');
  });

  it('joins the parts of an "and" card with +', () => {
    const card = makeCard({
      schoolMode: 'and',
      schools: [
        { school: 'Fire', level: 1 },
        { school: 'Air', level: 1 },
      ],
    });

    expect(schoolSummary(card)).toBe('Fire 1 + Air 1');
  });

  it('joins the parts of an "or" card with /', () => {
    const card = makeCard({
      schoolMode: 'or',
      schools: [
        { school: 'Holy', level: LEVEL_TWO },
        { school: 'War', level: LEVEL_TWO },
      ],
    });

    expect(schoolSummary(card)).toBe('Holy 2 / War 2');
  });
});
