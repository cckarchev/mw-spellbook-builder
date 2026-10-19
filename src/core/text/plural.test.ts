import { plural } from './plural';

const MANY = 4;

describe('plural', () => {
  it('uses the singular for one', () => {
    expect(plural(1, 'card', 'cards')).toBe('1 card');
  });

  it('uses the plural for more than one', () => {
    expect(plural(MANY, 'copy', 'copies')).toBe('4 copies');
  });

  it('uses the plural for zero', () => {
    expect(plural(0, 'problem', 'problems')).toBe('0 problems');
  });
});
