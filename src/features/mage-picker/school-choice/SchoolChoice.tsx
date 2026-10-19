import { Button } from '@/components/button/Button';
import { Dialog } from '@/components/dialog/Dialog';
import type { School } from '@/core/rules/types';
import styles from './SchoolChoice.module.css';

interface SchoolChoiceProps {
  open: boolean;
  schools: readonly School[];
  onChoose: (school: School) => void;
  onCancel: () => void;
}

/** Asks a mage with a build-time choice, such as the Wizard, for its school. */
export const SchoolChoice = ({ open, schools, onChoose, onCancel }: SchoolChoiceProps) => (
  <Dialog open={open} title="Choose a school" onClose={onCancel}>
    <div className={styles.schools}>
      {schools.map((school) => (
        <Button key={school} onClick={() => onChoose(school)}>
          {school}
        </Button>
      ))}
    </div>
    <div className={styles.actions}>
      <Button onClick={onCancel}>Cancel</Button>
    </div>
  </Dialog>
);
