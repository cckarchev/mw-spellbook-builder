import { parseCodexXml } from './readCodex';

const TERM_FONT = 0;
const TERM_PLAIN_FONT = 1;
const BODY_FONT = 2;
const BODY_BOLD_FONT = 3;
const SUPERSCRIPT_FONT = 4;
const HEADING_FONT = 5;

const LINE_START = 32;

interface Fragment {
  top: number;
  left?: number;
  font: number;
  text: string;
}

const BOLD_FONTS = new Set([TERM_FONT, BODY_BOLD_FONT]);

const textTag = ({ top, left = LINE_START, font, text }: Fragment): string => {
  const content = BOLD_FONTS.has(font) ? `<b>${text}</b>` : text;

  return `<text top="${top}" left="${left}" width="10" height="15" font="${font}">${content}</text>`;
};

const codexXml = (fragments: Fragment[]): string => `<?xml version="1.0"?>
<pdf2xml>
<page number="1">
  <fontspec id="${TERM_FONT}" size="15" family="Bold" color="#000000"/>
  <fontspec id="${TERM_PLAIN_FONT}" size="15" family="Plain" color="#000000"/>
  <fontspec id="${BODY_FONT}" size="12" family="Plain" color="#000000"/>
  <fontspec id="${BODY_BOLD_FONT}" size="12" family="Bold" color="#000000"/>
  <fontspec id="${SUPERSCRIPT_FONT}" size="8" family="Plain" color="#000000"/>
  <fontspec id="${HEADING_FONT}" size="27" family="Plain" color="#000000"/>
${fragments.map(textTag).join('\n')}
</page>
</pdf2xml>`;

describe('parseCodexXml', () => {
  it('starts an entry at each large bold term and joins its lines with spaces', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Aegis X ' },
      { top: 12, left: 100, font: BODY_FONT, text: 'All attacks made against this' },
      { top: 28, font: BODY_FONT, text: 'Object remove X attack dice.' },
      { top: 50, font: TERM_FONT, text: 'Anchored' },
      { top: 52, left: 100, font: BODY_FONT, text: 'Cannot be Teleported.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([
      { term: 'Aegis X', definition: 'All attacks made against this Object remove X attack dice.' },
      { term: 'Anchored', definition: 'Cannot be Teleported.' },
    ]);
  });

  it('keeps bold references inside a definition as plain text', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Activate ' },
      { top: 12, left: 100, font: BODY_FONT, text: 'Flip its ' },
      { top: 12, left: 200, font: BODY_BOLD_FONT, text: 'Action' },
      { top: 12, left: 250, font: BODY_FONT, text: ' marker.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([
      { term: 'Activate', definition: 'Flip its Action marker.' },
    ]);
  });

  it('joins a term split into several large fragments on its line', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Pet (' },
      { top: 10, left: 66, font: TERM_PLAIN_FONT, text: 'Beastmaster' },
      { top: 10, left: 149, font: TERM_FONT, text: ')' },
      { top: 12, left: 160, font: BODY_FONT, text: 'A companion.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([{ term: 'Pet (Beastmaster)', definition: 'A companion.' }]);
  });

  it('reads blank large fragments in the middle of a definition as spaces', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Damage Barrier ' },
      { top: 12, left: 150, font: BODY_FONT, text: 'Deals damage' },
      { top: 10, left: 433, font: TERM_FONT, text: ' ' },
      { top: 12, left: 440, font: BODY_FONT, text: 'back.' },
      { top: 30, font: TERM_FONT, text: ' ' },
    ]);

    expect(parseCodexXml(xml)).toEqual([
      { term: 'Damage Barrier', definition: 'Deals damage back.' },
    ]);
  });

  it('attaches a superscript to the word before it', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Slow' },
      { top: 12, left: 100, font: BODY_FONT, text: 'Its 2' },
      { top: 11, left: 130, font: SUPERSCRIPT_FONT, text: 'nd' },
      { top: 12, left: 140, font: BODY_FONT, text: ' move is lost.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([{ term: 'Slow', definition: 'Its 2nd move is lost.' }]);
  });

  it('joins a line that ends in a hyphen without a space', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Vine Markers' },
      { top: 12, left: 100, font: BODY_FONT, text: 'Hinder enemy non-' },
      { top: 28, font: BODY_FONT, text: 'Flying Creatures.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([
      { term: 'Vine Markers', definition: 'Hinder enemy non-Flying Creatures.' },
    ]);
  });

  it('decodes XML entities', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Zone Attack or Spell' },
      { top: 12, left: 200, font: BODY_FONT, text: 'Friendly &amp; enemy &quot;Objects&quot;.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([
      { term: 'Zone Attack or Spell', definition: 'Friendly & enemy "Objects".' },
    ]);
  });

  it('stops at the first section heading', () => {
    const xml = codexXml([
      { top: 10, font: TERM_FONT, text: 'Zone' },
      { top: 12, left: 100, font: BODY_FONT, text: 'An area of the Arena.' },
      { top: 40, font: HEADING_FONT, text: 'Battlegrounds Tiles ' },
      { top: 80, font: TERM_FONT, text: 'Spiked Pit' },
      { top: 82, left: 100, font: BODY_FONT, text: 'A tile.' },
    ]);

    expect(parseCodexXml(xml)).toEqual([{ term: 'Zone', definition: 'An area of the Arena.' }]);
  });
});
