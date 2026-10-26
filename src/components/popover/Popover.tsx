import { type ReactNode, type RefObject, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Popover.module.css";
import { useDismiss } from "./useDismiss";
import { usePlacement } from "./usePlacement";

interface PopoverProps {
  id: string;
  isOpen: boolean;
  /** The button the popover opens next to. */
  anchorRef: RefObject<HTMLButtonElement | null>;
  /**
   * 'dialog' for content opened on purpose, 'status' for a message about what
   * was just tapped.
   */
  role: "dialog" | "status";
  label?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A box over the page next to its button, closed by a tap outside it or Escape.
 * It floats, so opening it never moves the page under it.
 */
export const Popover = ({
  id,
  isOpen,
  anchorRef,
  role,
  label,
  onClose,
  children,
}: PopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const placement = usePlacement(isOpen, { anchorRef, popoverRef });

  useDismiss(isOpen, { anchorRef, popupRef: popoverRef }, onClose);

  if (!isOpen) {
    return null;
  }

  const style = placement
    ? { left: placement.left, top: placement.top }
    : undefined;
  // A status message is read out as it appears; only a dialog is named.
  const roleProps =
    role === "dialog" ? { role, "aria-label": label } : { role };

  return createPortal(
    <div
      ref={popoverRef}
      id={id}
      {...roleProps}
      className={styles.popover}
      data-placed={placement !== null}
      style={style}
    >
      {children}
    </div>,
    document.body,
  );
};
