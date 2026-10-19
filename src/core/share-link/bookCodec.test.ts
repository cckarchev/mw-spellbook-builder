import type { Book } from '@/core/rules/types';
import { cards } from '@/data/catalog';
import { toBase64Url } from './base64Url';
import { decodeBook, encodeBook } from './bookCodec';

const THREE_COPIES = 3;
const UNSUPPORTED_VERSION = 2;

const [firstCard, secondCard] = cards;
const firstId = firstCard?.id ?? '';
const secondId = secondCard?.id ?? '';
const firstCode = firstCard?.code ?? '';

const wizardFireBook: Book = {
  mageId: 'wizard',
  schoolChoice: 'Fire',
  counts: { [firstId]: 1, [secondId]: THREE_COPIES },
};

const encodeWire = (wire: unknown): string => toBase64Url(JSON.stringify(wire));

describe('bookCodec: round trip', () => {
  it('decodes what it encodes', () => {
    const decoded = decodeBook(encodeBook(wizardFireBook));

    expect(decoded).toEqual({ book: wizardFireBook, unknownCodes: [] });
  });

  it('encodes an empty book', () => {
    const empty: Book = { mageId: null, schoolChoice: null, counts: {} };

    expect(decodeBook(encodeBook(empty))?.book).toEqual(empty);
  });
});

describe('bookCodec: links from older data or hand edits', () => {
  it('reports unknown card codes and leaves them out of the book', () => {
    const encoded = encodeWire({ v: 1, m: 'warlock', c: { [firstCode]: 2, zzzzzzzz: 1 } });

    expect(decodeBook(encoded)).toEqual({
      book: { mageId: 'warlock', schoolChoice: null, counts: { [firstId]: 2 } },
      unknownCodes: ['zzzzzzzz'],
    });
  });

  it('keeps a quantity above the copy limit so validation can report it', () => {
    const tooMany = 9;
    const encoded = encodeWire({ v: 1, m: 'warlock', c: { [firstCode]: tooMany } });

    expect(decodeBook(encoded)?.book.counts).toEqual({ [firstId]: tooMany });
  });

  it('drops quantities that are not positive whole numbers', () => {
    const encoded = encodeWire({ v: 1, m: 'warlock', c: { [firstCode]: -1 } });

    expect(decodeBook(encoded)?.book.counts).toEqual({});
  });

  it('clears an unknown mage', () => {
    const encoded = encodeWire({ v: 1, m: 'not-a-mage', c: {} });

    expect(decodeBook(encoded)?.book.mageId).toBeNull();
  });

  it('clears a school choice that is not a school', () => {
    const encoded = encodeWire({ v: 1, m: 'wizard', s: 'Lava', c: {} });

    expect(decodeBook(encoded)?.book.schoolChoice).toBeNull();
  });
});

describe('bookCodec: unreadable links', () => {
  it.each(['%%%garbage%%%', toBase64Url('not json'), encodeWire(['an', 'array']), ''])(
    'returns null for %s',
    (encoded) => {
      expect(decodeBook(encoded)).toBeNull();
    },
  );

  it('returns null for an unsupported version', () => {
    expect(decodeBook(encodeWire({ v: UNSUPPORTED_VERSION, m: 'wizard', c: {} }))).toBeNull();
  });

  it('returns null when the card counts are not an object', () => {
    expect(decodeBook(encodeWire({ v: 1, m: 'wizard', c: 'cards' }))).toBeNull();
  });
});
