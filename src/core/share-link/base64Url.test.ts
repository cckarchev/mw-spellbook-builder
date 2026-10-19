import { fromBase64Url, toBase64Url } from './base64Url';

describe('base64Url', () => {
  it('round trips text', () => {
    const text = '{"v":1,"m":"wizard"}';

    expect(fromBase64Url(toBase64Url(text))).toBe(text);
  });

  it('round trips text outside Latin-1', () => {
    const text = 'Señor • Mago';

    expect(fromBase64Url(toBase64Url(text))).toBe(text);
  });

  it('uses only url-safe characters and no padding', () => {
    const encoded = toBase64Url('??>>~~~');

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('throws on characters outside the alphabet', () => {
    expect(() => fromBase64Url('not base64!')).toThrow();
  });
});
