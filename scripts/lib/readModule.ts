import { XMLParser } from 'fast-xml-parser';
import { unzipSync } from 'fflate';

export interface RawCard {
  id: string;
  name: string;
  /** Top-level card properties by name. Alternate card faces are ignored. */
  properties: Record<string, string>;
}

interface RawSet {
  id: string;
  name: string;
  cards: RawCard[];
}

interface XmlProperty {
  '@_name': string;
  '@_value'?: string;
  '#text'?: string;
}

interface XmlCard {
  '@_id': string;
  '@_name': string;
  property?: XmlProperty[];
}

interface XmlSet {
  set: {
    '@_id': string;
    '@_name': string;
    cards?: { card?: XmlCard[] };
  };
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
};

const MARKUP_PATTERN = /<[^>]*>/g;
const ENTITY_PATTERN = /&(amp|lt|gt|quot|apos);/g;
const LINE_BREAK_PATTERN = /\r\n?/g;

const PROPERTY_PATH = 'set.cards.card.property';
const ARRAY_PATHS = new Set(['set.cards.card', PROPERTY_PATH]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  parseAttributeValue: false,
  // Keeps the raw inner markup of element-text properties such as Effect.
  stopNodes: [PROPERTY_PATH],
  isArray: (_name, jpath) => ARRAY_PATHS.has(String(jpath)),
});

/** Element text in the module may hold markup (`<b>`, `<i>`) and entities. */
const cleanText = (text: string): string => {
  const withoutMarkup = text.replace(MARKUP_PATTERN, '');
  const decoded = withoutMarkup.replace(ENTITY_PATTERN, (entity) => ENTITIES[entity] ?? entity);

  return decoded.replace(LINE_BREAK_PATTERN, '\n').trim();
};

const propertyValue = (property: XmlProperty): string => {
  if (property['@_value'] !== undefined) {
    return property['@_value'];
  }

  return cleanText(property['#text'] ?? '');
};

const toRawCard = (card: XmlCard): RawCard => {
  const properties: Record<string, string> = {};

  for (const property of card.property ?? []) {
    properties[property['@_name']] = propertyValue(property);
  }

  return { id: card['@_id'], name: card['@_name'], properties };
};

export const parseSetXml = (xml: string): RawSet => {
  const parsed = parser.parse(xml) as XmlSet;
  const cards = parsed.set.cards?.card ?? [];

  return {
    id: parsed.set['@_id'],
    name: parsed.set['@_name'],
    cards: cards.map(toRawCard),
  };
};

const setEntryPath = (setId: string): string => `def/Sets/${setId}/set.xml`;

/** Reads the given sets from an OCTGN game package (`.nupkg`, a zip). */
export const readModuleSets = (
  archive: Uint8Array,
  setIds: readonly string[],
): Map<string, RawSet> => {
  const wanted = new Set(setIds.map(setEntryPath));
  const entries = unzipSync(archive, { filter: (file) => wanted.has(file.name) });
  const decoder = new TextDecoder();
  const sets = new Map<string, RawSet>();

  for (const setId of setIds) {
    const entry = entries[setEntryPath(setId)];

    if (!entry) {
      throw new Error(`Set ${setId} not found in the module package`);
    }

    sets.set(setId, parseSetXml(decoder.decode(entry)));
  }

  return sets;
};
