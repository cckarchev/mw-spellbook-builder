import { strToU8, zipSync } from 'fflate';
import { parseSetXml, readModuleSets } from './readModule';

const SET_ID = '36d0ba97-faee-4117-895c-2c08eed318eb';
const OTHER_SET_ID = '85c1fe26-1bed-4efe-9756-a8d4e01079c5';

const SET_XML = `<?xml version="1.0" encoding="utf-8"?>
<set id="${SET_ID}" name="Mage Wars Arena">
  <cards>
    <card id="d8562a1d-6a95-4ca4-99aa-91c5ca769a33" name="Fireball">
      <property name="Type" value="Attack"/>
      <property name="Level" value="2"/>
      <property name="Traits">Cantrip • Unique</property>
      <property name="Effect"><b>Burn</b> it &amp; more.
Second line.</property>
      <alternate name="Fireball" type="2">
        <property name="Type" value="Creature"/>
      </alternate>
    </card>
    <card id="755727ff-55c8-417a-a376-958f1dbb8d99" name="Blinding Flash">
      <property name="Type" value="Incantation"/>
    </card>
  </cards>
</set>`;

describe('parseSetXml', () => {
  it('reads the set id and name', () => {
    const set = parseSetXml(SET_XML);

    expect(set.id).toBe(SET_ID);
    expect(set.name).toBe('Mage Wars Arena');
  });

  it('reads every card with its id and name', () => {
    const set = parseSetXml(SET_XML);

    expect(set.cards.map((card) => card.name)).toEqual(['Fireball', 'Blinding Flash']);
    expect(set.cards[0]?.id).toBe('d8562a1d-6a95-4ca4-99aa-91c5ca769a33');
  });

  it('reads properties given as a value attribute as strings', () => {
    const [fireball] = parseSetXml(SET_XML).cards;

    expect(fireball?.properties.Level).toBe('2');
  });

  it('reads properties given as element text the same way', () => {
    const [fireball] = parseSetXml(SET_XML).cards;

    expect(fireball?.properties.Traits).toBe('Cantrip • Unique');
  });

  it('strips markup and decodes entities in element text', () => {
    const [fireball] = parseSetXml(SET_XML).cards;

    expect(fireball?.properties.Effect).toBe('Burn it & more.\nSecond line.');
  });

  it('ignores properties of alternate card faces', () => {
    const [fireball] = parseSetXml(SET_XML).cards;

    expect(fireball?.properties.Type).toBe('Attack');
  });

  it('reads a set with a single card', () => {
    const xml = `<set id="${SET_ID}" name="One"><cards><card id="a" name="Only"><property name="Type" value="Attack"/></card></cards></set>`;

    expect(parseSetXml(xml).cards).toHaveLength(1);
  });
});

describe('readModuleSets', () => {
  it('reads the requested sets from the package archive by id', () => {
    const archive = zipSync({
      [`def/Sets/${SET_ID}/set.xml`]: strToU8(SET_XML),
      'def/Decks/ignored.o8d': strToU8('<deck/>'),
    });

    const sets = readModuleSets(archive, [SET_ID]);

    expect(sets.get(SET_ID)?.cards).toHaveLength(2);
  });

  it('throws when a requested set is missing from the archive', () => {
    const archive = zipSync({ [`def/Sets/${SET_ID}/set.xml`]: strToU8(SET_XML) });

    expect(() => readModuleSets(archive, [OTHER_SET_ID])).toThrow(OTHER_SET_ID);
  });
});
