import { matchRanges } from "./matchRanges";

describe("matchRanges", () => {
  it("finds every match in original indices", () => {
    expect(matchRanges("Burn and burn", "burn")).toEqual([
      { start: 0, end: 4 },
      { start: 9, end: 13 },
    ]);
  });

  it("covers the original characters when folding changes them", () => {
    expect(matchRanges("Siren’s Call", "siren's")).toEqual([
      { start: 0, end: 7 },
    ]);
  });

  it("covers an accent written as its own mark", () => {
    expect(matchRanges("Écho", "echo")).toEqual([{ start: 0, end: 5 }]);
  });

  it("does not overlap matches", () => {
    expect(matchRanges("aaa", "aa")).toEqual([{ start: 0, end: 2 }]);
  });

  it("returns nothing for no query", () => {
    expect(matchRanges("Burn", "")).toEqual([]);
  });
});
