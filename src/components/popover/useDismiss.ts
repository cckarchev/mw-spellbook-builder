import { type RefObject, useEffect } from "react";

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        anchorRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, anchorRef, popupRef, onClose]);
};
