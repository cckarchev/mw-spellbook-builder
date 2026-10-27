import { druid } from "@/core/rules/fixtures";
import { EMPTY_FILTERS } from "./filterCards";
import { scopeOf, withScope } from "./filterScope";

const DRUID_SCHOOLS = ["Nature", "Water"];

describe("scopeOf", () => {
  it('is all with no school chips and no "Only" filter', () => {
    expect(scopeOf({ ...EMPTY_FILTERS, query: "bolt" }, druid)).toBe("all");
  });

  it("is trained when the school chips are the mage's schools, in any order", () => {
    expect(
      scopeOf({ ...EMPTY_FILTERS, schools: ["Water", "Nature"] }, druid),
    ).toBe("trained");
  });

  it('is only when the "Only" cards are asked for', () => {
    expect(scopeOf({ ...EMPTY_FILTERS, onlyCards: true }, druid)).toBe("only");
  });

  it("is none of them for school chips picked by hand", () => {
    expect(
      scopeOf({ ...EMPTY_FILTERS, schools: ["Nature"] }, druid),
    ).toBeNull();
  });
});

describe("withScope", () => {
  const picked = {
    ...EMPTY_FILTERS,
    query: "wolf",
    types: ["Creature" as const],
    schools: ["Fire" as const],
  };

  it("fills the school chips with the mage's schools for trained", () => {
    const filters = withScope(picked, "trained", druid);

    expect(filters.schools).toEqual(DRUID_SCHOOLS);
    expect(filters.onlyCards).toBe(false);
  });

  it('asks for the "Only" cards and clears the school chips for only', () => {
    expect(withScope(picked, "only", druid)).toMatchObject({
      onlyCards: true,
      schools: [],
    });
  });

  it('clears the school chips and the "Only" filter for all, and keeps the rest', () => {
    const filters = withScope({ ...picked, onlyCards: true }, "all", druid);

    expect(filters).toMatchObject({
      onlyCards: false,
      schools: [],
      query: "wolf",
      types: ["Creature"],
    });
  });
});
