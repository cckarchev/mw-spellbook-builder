// Paths from Font Awesome Free 7.3.1 (https://fontawesome.com), icons under CC BY 4.0:
// https://fontawesome.com/license/free

const ICON_HEIGHT = 512;
const LIST_WIDTH = 512;
const GRID_WIDTH = 448;

/** Font Awesome "list": rows with bullets. Takes the text color and the font size. */
export const ListIcon = () => (
  <svg width="1em" height="1em" viewBox={`0 0 ${LIST_WIDTH} ${ICON_HEIGHT}`} aria-hidden="true">
    <path
      fill="currentColor"
      d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"
    />
  </svg>
);

/** Font Awesome "table-cells-large": four squares. Takes the text color and the font size. */
export const GridIcon = () => (
  <svg width="1em" height="1em" viewBox={`0 0 ${GRID_WIDTH} ${ICON_HEIGHT}`} aria-hidden="true">
    <path
      fill="currentColor"
      d="M384 96l-128 0 0 128 128 0 0-128zm64 128l0 192c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 128zM64 288l0 128 128 0 0-128-128 0zm128-64l0-128-128 0 0 128 128 0zm64 64l0 128 128 0 0-128-128 0z"
    />
  </svg>
);
