import type { ReactNode } from 'react';
import { Button } from '@/components/button/Button';
import styles from './ActionButton.module.css';

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** A small icon button; the label shows beside the icon above phone width, and as a tooltip. */
export const ActionButton = ({
  icon,
  label,
  primary = false,
  disabled = false,
  onClick,
}: ActionButtonProps) => (
  <Button
    variant={primary ? 'primary' : 'ghost'}
    size="small"
    className={styles.action}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
  >
    {icon}
    <span className={styles.label}>{label}</span>
  </Button>
);
