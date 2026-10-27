import type { Spellbook } from "@/core/rules/types";
import { cards } from "@/data/catalog";
import { toBase64Url } from "./base64Url";
import { decodeSpellbook, encodeSpellbook } from "./spellbookCodec";

const THREE_COPIES = 3;
const UNSUPPORTED_VERSION = 2;

const [firstCard, secondCard] = cards;
const firstId = firstCard?.id ?? "";
const secondId = secondCard?.id ?? "";
const firstCode = firstCard?.code ?? "";

const wizardSpellbook: Spellbook = {
  mageId: "wizard",
  counts: { [firstId]: 1, [secondId]: THREE_COPIES },
};

const encodeWire = (wire: unknown): string => toBase64Url(JSON.stringify(wire));

describe("spellbookCodec: round trip", () => {
  it("decodes what it encodes", () => {
    const decoded = decodeSpellbook(encodeSpellbook(wizardSpellbook));

    expect(decoded).toEqual({
      spellbook: wizardSpellbook,
      unknownCodes: [],
      unknownMage: null,
    });
  });

  it("encodes an empty spellbook", () => {
    const empty: Spellbook = { mageId: null, counts: {} };

    expect(decodeSpellbook(encodeSpellbook(empty))?.spellbook).toEqual(empty);
  });
});

describe("spellbookCodec: links from older data or hand edits", () => {
  it("reports unknown card codes and leaves them out of the spellbook", () => {
    const encoded = encodeWire({
      v: 1,
      m: "warlock",
      c: { [firstCode]: 2, zzzzzzzz: 1 },
    });

    expect(decodeSpellbook(encoded)).toEqual({
      spellbook: { mageId: "warlock", counts: { [firstId]: 2 } },
      unknownCodes: ["zzzzzzzz"],
      unknownMage: null,
    });
  });

  it("keeps a quantity above the copy limit so validation can report it", () => {
    const tooMany = 9;
    const encoded = encodeWire({
      v: 1,
      m: "warlock",
      c: { [firstCode]: tooMany },
    });

    expect(decodeSpellbook(encoded)?.spellbook.counts).toEqual({
      [firstId]: tooMany,
    });
  });

  it("drops quantities that are not positive whole numbers", () => {
    const encoded = encodeWire({ v: 1, m: "warlock", c: { [firstCode]: -1 } });

    expect(decodeSpellbook(encoded)?.spellbook.counts).toEqual({});
  });

  it("clears an unknown mage and reports its id", () => {
    const encoded = encodeWire({ v: 1, m: "not-a-mage", c: {} });
    const decoded = decodeSpellbook(encoded);

    expect(decoded?.spellbook.mageId).toBeNull();
    expect(decoded?.unknownMage).toBe("not-a-mage");
  });

  it("reports no unknown mage when the link names none", () => {
    const encoded = encodeWire({ v: 1, c: {} });

    expect(decodeSpellbook(encoded)?.unknownMage).toBeNull();
  });

  it("ignores the school of a link made when the Wizard chose an element", () => {
    const encoded = encodeWire({ v: 1, m: "wizard", s: "Fire", c: {} });

    expect(decodeSpellbook(encoded)?.spellbook).toEqual({
      mageId: "wizard",
      counts: {},
    });
  });
});

describe("spellbookCodec: unreadable links", () => {
  it.each([
    "%%%garbage%%%",
    toBase64Url("not json"),
    encodeWire(["an", "array"]),
    "",
  ])("returns null for %s", (encoded) => {
    expect(decodeSpellbook(encoded)).toBeNull();
  });

  it("returns null for an unsupported version", () => {
    expect(
      decodeSpellbook(
        encodeWire({ v: UNSUPPORTED_VERSION, m: "wizard", c: {} }),
      ),
    ).toBeNull();
  });

  it("returns null when the card counts are not an object", () => {
    expect(
      decodeSpellbook(encodeWire({ v: 1, m: "wizard", c: "cards" })),
    ).toBeNull();
  });
});
