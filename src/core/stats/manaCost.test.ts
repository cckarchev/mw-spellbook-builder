import { parseManaCost } from './manaCost';

const SEVEN = 7;
const THREE = 3;
const FIVE = 5;

describe('parseManaCost', () => {
  it('reads a plain number', () => {
    expect(parseManaCost('7')).toBe(SEVEN);
    expect(parseManaCost('0')).toBe(0);
  });

  it('adds up a compound cost', () => {
    expect(parseManaCost('2+1')).toBe(THREE);
    expect(parseManaCost('2+3')).toBe(FIVE);
  });

  it('reads any cost with X as variable', () => {
    expect(parseManaCost('X')).toBe('X');
    expect(parseManaCost('2X')).toBe('X');
  });

  it('gives null for an empty cost', () => {
    expect(parseManaCost('')).toBeNull();
  });
});
