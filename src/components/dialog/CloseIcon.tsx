const ICON_SIZE = 24;
const VIEW_BOX = `0 0 ${ICON_SIZE} ${ICON_SIZE}`;

/** An X. Takes the text color and the font size. */
export const CloseIcon = () => (
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
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
