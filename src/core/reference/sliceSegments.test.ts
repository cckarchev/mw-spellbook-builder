import type { GlossaryEntry } from "@/core/glossary/types";
import type { MarkedSegment } from "./markSegments";
import { sliceSegments } from "./sliceSegments";

const STUN: GlossaryEntry = { term: "Stun", definition: "Cannot act." };

// "Gains Stun now", with "ns St" highlighted across the term.
const SEGMENTS: MarkedSegment[] = [
  {
    entry: null,
    parts: [
      { text: "Gai", marked: false },
      { text: "ns ", marked: true },
    ],
  },
  {
    entry: STUN,
    parts: [
      { text: "St", marked: true },
      { text: "un", marked: false },
    ],
  },
  { entry: null, parts: [{ text: " now", marked: false }] },
];

describe("sliceSegments", () => {
  it("keeps the segments of a range, cut at its edges", () => {
    expect(sliceSegments(SEGMENTS, { start: 4, end: 11 })).toEqual([
      { entry: null, parts: [{ text: "s ", marked: true }] },
      {
        entry: STUN,
        parts: [
          { text: "St", marked: true },
          { text: "un", marked: false },
        ],
      },
      { entry: null, parts: [{ text: " ", marked: false }] },
    ]);
  });

  it("leaves out the segments outside the range", () => {
    expect(sliceSegments(SEGMENTS, { start: 11, end: 14 })).toEqual([
      { entry: null, parts: [{ text: "now", marked: false }] },
    ]);
  });
});
