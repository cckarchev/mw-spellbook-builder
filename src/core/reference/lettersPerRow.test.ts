import { lettersPerRow } from "./lettersPerRow";

const LETTERS = 26;
const CELL = 44;
const GAP = 4;
// Room for exactly this many cells side by side.
const roomFor = (cells: number) => cells * CELL + (cells - 1) * GAP;

describe("lettersPerRow", () => {
  it("keeps every letter in one row when they fit", () => {
    expect(lettersPerRow(LETTERS, roomFor(LETTERS), CELL, GAP)).toBe(LETTERS);
  });

  it("splits into even rows instead of a full row and a short one", () => {
    const twoRows = 20;
    const threeRows = 10;
    const half = 13;
    const third = 9;

    expect(lettersPerRow(LETTERS, roomFor(twoRows), CELL, GAP)).toBe(half);
    expect(lettersPerRow(LETTERS, roomFor(threeRows), CELL, GAP)).toBe(third);
  });

  it("fits at least one letter per row in a very narrow space", () => {
    expect(lettersPerRow(LETTERS, CELL / 2, CELL, GAP)).toBe(1);
  });
});
