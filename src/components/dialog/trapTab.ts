const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Moves Tab from the last focusable element to the first, and Shift+Tab the other way. */
export const trapTab = (event: KeyboardEvent, panel: HTMLElement) => {
  const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = focusable[0];
  const last = focusable.at(-1);
  const active = document.activeElement;
  const isOutside = !panel.contains(active);

  if (!(first && last)) {
    return;
  }

  if (event.shiftKey && (active === first || isOutside)) {
    event.preventDefault();
    last.focus();

    return;
  }

  if (!event.shiftKey && (active === last || isOutside)) {
    event.preventDefault();
    first.focus();
  }
};
