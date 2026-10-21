import { maxCopies } from "./copyLimit";
import { makeCard } from "./fixtures";

const LEVEL_ONE_COPIES = 6;
const HIGHER_LEVEL_COPIES = 4;
const LEVEL_TWO = 2;

describe("maxCopies", () => {
  it("allows six copies of a level 1 card", () => {
    const card = makeCard({ schools: [{ school: "Fire", level: 1 }] });

    expect(maxCopies(card)).toBe(LEVEL_ONE_COPIES);
  });

  it("allows four copies of a level 2 card", () => {
    const card = makeCard({ schools: [{ school: "Fire", level: LEVEL_TWO }] });

    expect(maxCopies(card)).toBe(HIGHER_LEVEL_COPIES);
  });

  it('counts both parts of an "and" card toward the level', () => {
    const card = makeCard({
      schoolMode: "and",
      schools: [
        { school: "Arcane", level: 1 },
        { school: "Dark", level: 1 },
      ],
    });

    expect(maxCopies(card)).toBe(HIGHER_LEVEL_COPIES);
  });

  it("allows one copy of an Epic card", () => {
    const card = makeCard({
      traits: ["Epic"],
      schools: [{ school: "Fire", level: 1 }],
    });

    expect(maxCopies(card)).toBe(1);
  });
});
