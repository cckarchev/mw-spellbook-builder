import { buildShareUrl, SPELLBOOK_PARAM } from "./shareUrl";

const ENCODED = "eyJ2IjoxfQ";
const ORIGIN = "https://mw.example.dev";
const MAGE_PATH = "/sistarran-wizard";

describe("buildShareUrl", () => {
  it("points at the mage in this app's builder", () => {
    const url = buildShareUrl({
      encoded: ENCODED,
      origin: ORIGIN,
      magePath: MAGE_PATH,
    });

    expect(url).toBe(`${ORIGIN}${MAGE_PATH}?${SPELLBOOK_PARAM}=${ENCODED}`);
  });
});
