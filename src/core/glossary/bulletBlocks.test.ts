import { bulletBlocks } from "./bulletBlocks";

const textsOf = (text: string) => {
  const { intro, items } = bulletBlocks(text);

  return {
    intro: text.slice(intro.start, intro.end),
    items: items.map((item) => text.slice(item.start, item.end)),
  };
};

describe("bulletBlocks", () => {
  it("keeps a definition without bullets as its intro alone", () => {
    expect(textsOf("A Creature that flies.")).toEqual({
      intro: "A Creature that flies.",
      items: [],
    });
  });

  it("splits the items after the intro, without the bullets or the spaces around them", () => {
    expect(
      textsOf("Powers below. • Air: roll more • Earth: gain armor."),
    ).toEqual({
      intro: "Powers below.",
      items: ["Air: roll more", "Earth: gain armor."],
    });
  });

  it("drops an empty item", () => {
    expect(textsOf("Powers: • Air •  • Earth")).toEqual({
      intro: "Powers:",
      items: ["Air", "Earth"],
    });
  });
});
