import styles from './RulesQuestions.module.css';

interface RulesQuestion {
  question: string;
  current: string;
}

// Where the OCTGN module, which the costs follow, and the printed cards disagree.
const QUESTIONS: RulesQuestion[] = [
  {
    question:
      'Can a mage use another mage\'s "Only" cards when trained in that school? The OCTGN validator allows it, such as Death Ring (Necromancer Only) for a Warlock.',
    current: 'Only the mage named on the card can use it, as the card text says.',
  },
  {
    question:
      'Can the Paladin use "Holy Mage Only" and "War Mage Only" cards above level 2, such as Divine Intervention? The module says no.',
    current: 'Allowed, since the Paladin is trained in both schools.',
  },
  {
    question:
      'Does an opposed school still cost triple on an "and" card when another part is within partial training? The module charges it double: Gerard Matranga costs the Druid 5 points, and Haruku costs the Paladin 3.',
    current: 'Double, as the module does.',
  },
];

/** Open rules questions under the mage picker, for players who know the answer. */
export const RulesQuestions = () => (
  <section className={styles.box} aria-labelledby="rules-questions-title">
    <h2 id="rules-questions-title" className={styles.title}>
      Rules we are still checking
    </h2>
    <p className={styles.intro}>
      Point costs follow the OCTGN module. On these questions the module and the cards disagree. If
      you know the answer, tell Tano or Ele.
    </p>
    <ol className={styles.list}>
      {QUESTIONS.map(({ question, current }) => (
        <li key={question} className={styles.item}>
          <p>{question}</p>
          <p className={styles.current}>For now: {current}</p>
        </li>
      ))}
    </ol>
  </section>
);
