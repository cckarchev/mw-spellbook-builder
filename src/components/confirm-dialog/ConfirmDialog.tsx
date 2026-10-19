import type { ReactNode } from 'react';
import { Button } from '@/components/button/Button';
import { Dialog } from '@/components/dialog/Dialog';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before a destructive action. Cancel comes first and takes the focus. */
export const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog open={open} title={title} onClose={onCancel}>
    <div className={styles.body}>{body}</div>
    <div className={styles.actions}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </Dialog>
);
