import { type RefObject, useEffect, useRef, useState } from "react";
import { trapTab } from "@/components/dialog/trapTab";
import { useOpenTermStore } from "@/features/shared/glossary-text/useOpenTermStore";

/**
 * Keeps the Quick reference modal: focus starts on the title, Tab stays inside,
 * Escape closes, and on close the focus goes back where it was. Opening also
 * closes any glossary popover underneath.
 */
export const useModalFocus = (
  panelRef: RefObject<HTMLElement | null>,
  titleRef: RefObject<HTMLElement | null>,
  close: () => void,
) => {
  // Read once, before the title takes the focus, to hand the focus back on
  // close.
  const [opener] = useState(() => document.activeElement);
  // Read through a ref, so a new close from a re-render does not move the focus
  // again.
  const closeRef = useRef(close);

  closeRef.current = close;

  useEffect(() => {
    titleRef.current?.focus();
    useOpenTermStore.setState({ openId: null });

    const handleKeyDown = (event: KeyboardEvent) => {
      // A field may have used the Escape already, such as the search clearing
      // its text.
      if (event.key === "Escape" && !event.defaultPrevented) {
        closeRef.current();
      }

      if (event.key === "Tab" && panelRef.current) {
        trapTab(event, panelRef.current);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (opener instanceof HTMLElement) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [opener, panelRef, titleRef]);
};
