import { type RefObject, useEffect } from "react";
import { useEscapeKey } from "../useEscapeKey";

interface DismissRefs {
  /** The button that opened the popup, which gets the focus back on Escape. */
  anchorRef: RefObject<HTMLButtonElement | null>;
  popupRef: RefObject<HTMLElement | null>;
}

/**
 * Closes the open popup on a tap outside it and its button, or on Escape, which
 * refocuses the button.
 */
export const useDismiss = (
  isOpen: boolean,
  { anchorRef, popupRef }: DismissRefs,
  onClose: () => void,
): void => {
  useEscapeKey(isOpen, () => {
    onClose();
    anchorRef.current?.focus();
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // A tap on another button closes this popup here, then opens the other with
    // its own click.
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const isInside =
        anchorRef.current?.contains(target) ||
        popupRef.current?.contains(target);

      if (!isInside) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, anchorRef, popupRef, onClose]);
};
