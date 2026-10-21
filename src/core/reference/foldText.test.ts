import { foldedOnce, foldQuery, foldText } from "./foldText";

const PRECOMPOSED = "Écho";
const DECOMPOSED = "E\u0301cho";
// The accent mark of the decomposed text, which folds away.
const ACCENT_AT = 1;

/** Every index of a text, plus its length. */
const everyIndex = (text: string): number[] =>
  Array.from({ length: text.length + 1 }, (_, index) => index);

describe("foldText", () => {
  it("lowercases, drops accents and maps each character back", () => {
    expect(foldText(PRECOMPOSED)).toEqual({
      folded: "echo",
      origins: everyIndex(PRECOMPOSED),
    });
  });

  it("maps back past an accent written as its own mark", () => {
    const origins = everyIndex(DECOMPOSED).filter(
      (index) => index !== ACCENT_AT,
    );

    expect(foldText(DECOMPOSED)).toEqual({ folded: "echo", origins });
  });

  it("reads a curly apostrophe as a straight one", () => {
    expect(foldText("Siren’s").folded).toBe("siren's");
  });

  it("folds plain and accented letters in the same text", () => {
    const text = "Burn Écho";

    expect(foldText(text)).toEqual({
      folded: "burn echo",
      origins: everyIndex(text),
    });
  });
});

describe("foldedOnce", () => {
  it("folds like foldText", () => {
    expect(foldedOnce(PRECOMPOSED)).toEqual(foldText(PRECOMPOSED));
  });

  it("folds each text only once", () => {
    expect(foldedOnce("Flame")).toBe(foldedOnce("Flame"));
  });
});

describe("foldQuery", () => {
  it("reads a query of spaces as no query", () => {
    expect(foldQuery("   ")).toBe("");
  });

  it("trims and folds the query", () => {
    expect(foldQuery("  Écho ")).toBe("echo");
  });

  it("waits for a second letter, since one matches nearly every term", () => {
    expect(foldQuery(" a ")).toBe("");
    expect(foldQuery("Ki")).toBe("ki");
  });
});
