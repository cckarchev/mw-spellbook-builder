import type { Card } from '@/core/rules/types';
import styles from './CardRow.module.css';

/** The opened part of a card row: the full card image and its game text. */
export const CardDetails = ({ card }: { card: Card }) => {
  const facts = [
    ['Type', card.type],
    ['Action', card.action],
    ['Range', card.range],
    ['Mana', card.manaCost],
    ['Expansion', card.expansion],
  ].filter(([, value]) => value !== '');
  const printedText = [card.attackBar, card.abilityBar, card.effect].filter((text) => text !== '');

  return (
    <div className={styles.expanded}>
      {card.image ? (
        <img className={styles.image} src={card.image} alt={card.name} loading="lazy" />
      ) : null}
      <div className={styles.text}>
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {printedText.map((text) => (
          <p key={text} className={styles.effect}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};
