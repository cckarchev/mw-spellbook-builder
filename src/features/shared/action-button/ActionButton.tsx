import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Button } from '@/components/button/Button';
import styles from './ActionButton.module.css';

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  label: string;
  primary?: boolean;
  /** Drawn after the label, such as the arrow of a button that opens a menu. */
  trailingIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/** A small icon button; the label shows beside the icon above phone width, and as a tooltip. */
export const ActionButton = ({
  icon,
  label,
  primary = false,
  trailingIcon,
  ...rest
}: ActionButtonProps) => (
  <Button
    variant={primary ? 'primary' : 'ghost'}
    size="small"
    className={styles.action}
    aria-label={label}
    title={label}
    {...rest}
  >
    {icon}
    <span className={styles.label}>{label}</span>
    {trailingIcon}
  </Button>
);
