import { applyGlossaryCorrections } from "./glossaryCorrections";

describe("applyGlossaryCorrections", () => {
  it("replaces the definition of the matching term and leaves the rest alone", () => {
    const cut = {
      term: "Passage Attacks",
      definition: "Attacked by the Wall. See",
    };
    const other = { term: "Pest", definition: "A small nuisance Creature." };
    const corrected = applyGlossaryCorrections(
      [cut, other],
      [
        {
          term: "Passage Attacks",
          definition: "Attacked by the Wall. See “Walls”.",
        },
      ],
    );

    expect(corrected).toEqual([
      {
        term: "Passage Attacks",
        definition: "Attacked by the Wall. See “Walls”.",
      },
      other,
    ]);
  });

  it("throws when a correction names a term that is not there, so a stale one shows up", () => {
    expect(() =>
      applyGlossaryCorrections(
        [{ term: "Pest", definition: "A small nuisance Creature." }],
        [{ term: "Passage Attacks", definition: "Attacked by the Wall." }],
      ),
    ).toThrow("Passage Attacks");
  });
});
