import { placePopover } from "./placePopover";

const GUTTER = 8;
const GAP = 4;
const TERM_WIDTH = 40;
const TERM_HEIGHT = 20;
const PHONE = { width: 360, height: 640 };
const POPOVER = { width: 200, height: 100 };

// Rows of the page to put the term on.
const MIDDLE_ROW = 100;
const BOTTOM_ROW = PHONE.height - POPOVER.height + TERM_HEIGHT;

/** A term with its top left corner at (left, top). */
const anchorAt = (left: number, top: number) => ({
  left,
  top,
  right: left + TERM_WIDTH,
  bottom: top + TERM_HEIGHT,
});

const place = (
  anchor: ReturnType<typeof anchorAt>,
  viewport: { width: number; height: number } = PHONE,
) =>
  placePopover({
    anchor,
    popover: POPOVER,
    viewport,
    gutter: GUTTER,
    gap: GAP,
  });

const centeredLeft = (termLeft: number) =>
  termLeft + TERM_WIDTH / 2 - POPOVER.width / 2;
const belowTop = (termTop: number) => termTop + TERM_HEIGHT + GAP;

describe("placePopover", () => {
  it("centers the popover below the anchor", () => {
    const termLeft = PHONE.width / 2 - TERM_WIDTH / 2;

    expect(place(anchorAt(termLeft, MIDDLE_ROW))).toEqual({
      left: centeredLeft(termLeft),
      top: belowTop(MIDDLE_ROW),
    });
  });

  it("keeps the gutter on the left edge", () => {
    expect(place(anchorAt(GUTTER, MIDDLE_ROW)).left).toBe(GUTTER);
  });

  it("keeps the gutter on the right edge", () => {
    const termLeft = PHONE.width - TERM_WIDTH - GUTTER;

    expect(place(anchorAt(termLeft, MIDDLE_ROW)).left).toBe(
      PHONE.width - GUTTER - POPOVER.width,
    );
  });

  it("goes above the anchor when there is no room below", () => {
    expect(place(anchorAt(GUTTER, BOTTOM_ROW)).top).toBe(
      BOTTOM_ROW - GAP - POPOVER.height,
    );
  });

  it("stays below when there is no room above either", () => {
    const short = { width: PHONE.width, height: POPOVER.height + TERM_HEIGHT };

    expect(place(anchorAt(GUTTER, GUTTER), short).top).toBe(belowTop(GUTTER));
  });

  it("starts at the gutter when the popover is wider than the viewport", () => {
    const narrow = { width: POPOVER.width - GUTTER, height: PHONE.height };

    expect(place(anchorAt(GUTTER, MIDDLE_ROW), narrow).left).toBe(GUTTER);
  });
});
