const ICON_SIZE = 24;
const VIEW_BOX = `0 0 ${ICON_SIZE} ${ICON_SIZE}`;

/** A card with text lines: the stats card. Takes the text color and the font size. */
export const StatsIcon = () => (
  <svg
    width="1em"
    height="1em"
    viewBox={VIEW_BOX}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);
