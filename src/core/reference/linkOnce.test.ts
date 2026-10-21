import { buildGlossaryIndex, splitByTerms } from "@/core/glossary/findTerms";
import type { GlossaryEntry } from "@/core/glossary/types";
import { linkOnce } from "./linkOnce";

const entry = (term: string): GlossaryEntry => ({
  term,
  definition: "Something.",
});

const bloodreaper = entry("Bloodreaper (Warlock)");
const creature = entry("Creature");
const index = buildGlossaryIndex([bloodreaper, creature]);

describe("linkOnce", () => {
  it("links only the first mention of a term and never the entry itself", () => {
    const segments = splitByTerms(
      "Creature attacks a Creature. Bloodreaper (Warlock).",
      index,
    );

    expect(linkOnce(segments, bloodreaper)).toEqual([
      { text: "Creature", entry: creature },
      { text: " attacks a Creature. Bloodreaper (Warlock).", entry: null },
    ]);
  });

  it("keeps a text without terms as it is", () => {
    const segments = splitByTerms("Nothing here.", index);

    expect(linkOnce(segments, creature)).toEqual([
      { text: "Nothing here.", entry: null },
    ]);
  });
});
