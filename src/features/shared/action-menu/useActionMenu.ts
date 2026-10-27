import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useDismiss } from "@/components/popover/useDismiss";

const FIRST = 0;
const ITEM_SELECTOR = '[role="menuitem"]';
const MOVE_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

/**
 * Where an arrow, Home or End key moves the focus from the current item,
 * wrapping at both ends.
 */
const nextIndex = (key: string, current: number, last: number): number => {
  switch (key) {
    case "ArrowDown":
      return current === last ? FIRST : current + 1;
    case "ArrowUp":
      return current <= FIRST ? last : current - 1;
    case "Home":
      return FIRST;
    default:
      return last;
  }
};

/** Moves the focus through the menu's items with the arrow keys. */
const focusItem = (menu: HTMLElement, key: string) => {
  const items = [...menu.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR)];
  const current = items.indexOf(document.activeElement as HTMLButtonElement);

  items[nextIndex(key, current, items.length - 1)]?.focus();
};

/**
 * A menu button's open state and keyboard: the menu opens on its first item,
 * the arrow keys move through the items, and Escape, Tab, a tap outside or
 * picking an item close it.
 */
export const useActionMenu = () => {
  const menuId = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useDismiss(isOpen, { anchorRef, popupRef }, close);

  useEffect(() => {
    if (isOpen) {
      popupRef.current
        ?.querySelector<HTMLButtonElement>(ITEM_SELECTOR)
        ?.focus();
    }
  }, [isOpen]);

  const toggle = () => {
    setIsOpen((open) => !open);
  };

  const select = (onSelect: () => void) => {
    close();
    anchorRef.current?.focus();
    onSelect();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      close();

      return;
    }

    if (!MOVE_KEYS.has(event.key)) {
      return;
    }

    event.preventDefault();
    focusItem(event.currentTarget, event.key);
  };

  return { menuId, anchorRef, popupRef, isOpen, toggle, select, handleKeyDown };
};
