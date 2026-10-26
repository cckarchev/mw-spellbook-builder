interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Size {
  width: number;
  height: number;
}

interface PlacePopoverInput {
  /** The element the popover points at, in viewport coordinates. */
  anchor: Box;
  popover: Size;
  viewport: Size;
  /** The space kept free along the viewport edges. */
  gutter: number;
  /** The space between the anchor and the popover. */
  gap: number;
}

export interface Placement {
  left: number;
  top: number;
}

/**
 * Where to put a popover so it stays on screen: centered under the anchor, or
 * above it when it does not fit below, and pushed in from the side edges.
 */
export const placePopover = ({
  anchor,
  popover,
  viewport,
  gutter,
  gap,
}: PlacePopoverInput): Placement => {
  const anchorCenter = (anchor.left + anchor.right) / 2;
  const centeredLeft = anchorCenter - popover.width / 2;
  const maxLeft = viewport.width - gutter - popover.width;
  const left = Math.max(gutter, Math.min(centeredLeft, maxLeft));

  const below = anchor.bottom + gap;
  const above = anchor.top - gap - popover.height;
  const fitsBelow = below + popover.height <= viewport.height - gutter;
  const fitsAbove = above >= gutter;
  const top = !fitsBelow && fitsAbove ? above : below;

  return { left, top };
};
