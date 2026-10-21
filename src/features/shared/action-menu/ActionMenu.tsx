import type { ReactNode } from "react";
import { FaIcon } from "@/components/fa-icon/FaIcon";
import { ActionButton } from "../action-button/ActionButton";
import styles from "./ActionMenu.module.css";
import { useActionMenu } from "./useActionMenu";

const CARET_WIDTH = 320;
const CARET_PATH =
  "M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z";

/** Font Awesome "caret-down": the arrow of a button that opens a menu. */
const CaretIcon = () => <FaIcon width={CARET_WIDTH} path={CARET_PATH} />;

export interface ActionMenuItem {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

interface ActionMenuProps {
  icon: ReactNode;
  label: string;
  primary?: boolean;
  items: ActionMenuItem[];
}

/** An action button that opens a short menu of actions below it. */
export const ActionMenu = ({
  icon,
  label,
  primary = false,
  items,
}: ActionMenuProps) => {
  const { menuId, anchorRef, popupRef, isOpen, toggle, select, handleKeyDown } =
    useActionMenu();

  return (
    <div className={styles.wrap}>
      <ActionButton
        ref={anchorRef}
        icon={icon}
        label={label}
        primary={primary}
        trailingIcon={<CaretIcon />}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggle}
      />
      {isOpen ? (
        <div
          ref={popupRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className={styles.menu}
          onKeyDown={handleKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={styles.item}
              onClick={() => select(item.onSelect)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
