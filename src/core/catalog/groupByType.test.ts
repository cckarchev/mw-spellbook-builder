import { groupByType } from './groupByType';

describe('groupByType', () => {
  it('orders groups by TYPE_ORDER, drops empty ones and sorts items by name', () => {
    const groups = groupByType([
      { type: 'Incantation' as const, name: 'Teleport' },
      { type: 'Attack' as const, name: 'Hurl Rock' },
      { type: 'Incantation' as const, name: 'Dissolve' },
      { type: 'Attack' as const, name: 'Fireball' },
    ]);

    expect(groups).toEqual([
      {
        type: 'Attack',
        items: [
          { type: 'Attack', name: 'Fireball' },
          { type: 'Attack', name: 'Hurl Rock' },
        ],
      },
      {
        type: 'Incantation',
        items: [
          { type: 'Incantation', name: 'Dissolve' },
          { type: 'Incantation', name: 'Teleport' },
        ],
      },
    ]);
  });

  it('returns no groups for no items', () => {
    expect(groupByType([])).toEqual([]);
  });
});
