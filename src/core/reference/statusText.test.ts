import { statusText } from './statusText';

const TOTAL = 209;
const SEVERAL = 3;

describe('statusText', () => {
  it('counts every term without a query', () => {
    expect(statusText(TOTAL, false, 0)).toBe('209 terms');
  });

  it('counts the matches of a query', () => {
    expect(statusText(TOTAL, true, SEVERAL)).toBe('3 matches');
    expect(statusText(TOTAL, true, 1)).toBe('1 match');
    expect(statusText(TOTAL, true, 0)).toBe('No matches');
  });
});
