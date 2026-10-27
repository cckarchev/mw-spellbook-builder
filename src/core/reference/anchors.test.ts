import {
  letterAnchorId,
  termAnchorId,
  termLink,
  termOfHash,
  termPath,
} from "./anchors";

const TERMS = ["Armor +/- X", "Destroyed"];

describe("anchors", () => {
  it("turns a term into an anchor id", () => {
    expect(termAnchorId("Armor +/- X")).toBe("term-armor-x");
    expect(termAnchorId("Siren’s Call")).toBe("term-sirens-call");
  });

  it("turns a letter into an anchor id", () => {
    expect(letterAnchorId("A")).toBe("letter-a");
  });
});

describe("term links", () => {
  it("points at a term in the Quick reference", () => {
    expect(termPath("Armor +/- X")).toBe("/reference#term-armor-x");
  });

  it("makes the full link to a term", () => {
    expect(termLink("https://example.com", "Destroyed")).toBe(
      "https://example.com/reference#term-destroyed",
    );
  });

  it("finds the term an address hash points at", () => {
    expect(termOfHash("#term-armor-x", TERMS)).toBe("Armor +/- X");
  });

  it("finds no term for an empty or unknown hash", () => {
    expect(termOfHash("", TERMS)).toBeNull();
    expect(termOfHash("#term-nothing", TERMS)).toBeNull();
    expect(termOfHash("#letter-a", TERMS)).toBeNull();
  });
});
