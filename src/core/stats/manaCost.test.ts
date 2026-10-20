import { parseManaCost } from './manaCost';

const SEVEN = 7;

describe('parseManaCost', () => {
  it('reads a plain number', () => {
    expect(parseManaCost('7')).toBe(SEVEN);
    expect(parseManaCost('0')).toBe(0);
  });

  it('reads a casting plus reveal cost as its casting cost', () => {
    expect(parseManaCost('2+3')).toBe(2);
  });

  it('reads any cost with X as variable', () => {
    expect(parseManaCost('X')).toBe('X');
    expect(parseManaCost('2X')).toBe('X');
  });

  it('gives null for an empty cost', () => {
    expect(parseManaCost('')).toBeNull();
  });
});
