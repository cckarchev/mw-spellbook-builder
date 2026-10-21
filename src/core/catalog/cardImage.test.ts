import { cardCode, cardImagePath } from "./cardImage";

describe("cardCode", () => {
  it("is the first 8 characters of the card id", () => {
    expect(cardCode("4208e1b0-b570-42de-9e62-5ce15b97b91e")).toBe("4208e1b0");
  });
});

describe("cardImagePath", () => {
  it("points at the card image in public/cards by its code", () => {
    expect(cardImagePath("4208e1b0")).toBe("/cards/4208e1b0.webp");
  });
});
