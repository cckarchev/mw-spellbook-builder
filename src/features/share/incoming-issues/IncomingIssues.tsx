import { Button } from "@/components/button/Button";
import { Dialog } from "@/components/dialog/Dialog";
import styles from "./IncomingIssues.module.css";

interface IncomingIssuesProps {
  problems: string[];
  onDismiss: () => void;
}

/** What was wrong with a spellbook opened from a link. Closed while there is nothing to say. */
export const IncomingIssues = ({
  problems,
  onDismiss,
}: IncomingIssuesProps) => (
  <Dialog
    open={problems.length > 0}
    title="Check this spellbook"
    onClose={onDismiss}
  >
    <ul className={styles.problems}>
      {problems.map((problem) => (
        <li key={problem}>{problem}</li>
      ))}
    </ul>
    <div className={styles.actions}>
      <Button variant="primary" onClick={onDismiss}>
        OK
      </Button>
    </div>
  </Dialog>
);
