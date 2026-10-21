// Draws icons from Font Awesome Free 7.3.1 (https://fontawesome.com), icons under CC BY 4.0:
// https://fontawesome.com/license/free

// Every Font Awesome icon is this tall; the width changes per icon.
const ICON_HEIGHT = 512;

interface FaIconProps {
  /** The width of the icon's view box, as Font Awesome lists it. */
  width: number;
  /** The icon's SVG path, copied from Font Awesome. */
  path: string;
}

/** A Font Awesome icon. Takes the text color and the font size, and is hidden from screen readers. */
export const FaIcon = ({ width, path }: FaIconProps) => (
  <svg
    width="1em"
    height="1em"
    viewBox={`0 0 ${width} ${ICON_HEIGHT}`}
    aria-hidden="true"
  >
    <path fill="currentColor" d={path} />
  </svg>
);
