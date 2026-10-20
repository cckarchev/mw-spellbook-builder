import type { ReactNode } from 'react';
import type { Card } from '@/core/rules/types';
import { GlossaryText } from '@/features/shared/glossary-text/GlossaryText';
import { ZoomableImage } from '../zoomable-image/ZoomableImage';
import styles from './CardRow.module.css';

const TRAIT_SEPARATOR = ', ';

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.fact}>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const TraitList = ({ traits }: { traits: string[] }) =>
  traits.map((trait, position) => (
    <span key={trait}>
      {position > 0 ? TRAIT_SEPARATOR : null}
      <GlossaryText text={trait} />
    </span>
  ));

/** The opened part of a card row: the full card image and its game text, with tappable terms. */
export const CardDetails = ({ card }: { card: Card }) => {
  const facts = [
    ['Type', card.type],
    ['Action', card.action],
    ['Range', card.range],
    ['Target', card.target],
    ['Mana', card.manaCost],
  ].filter(([, value]) => value !== '');
  const printedText = [card.attackBar, card.abilityBar, card.effect].filter((text) => text !== '');
  const hasTraits = card.traits.length > 0;

  return (
    <div className={styles.expanded}>
      {card.image ? (
        <ZoomableImage name={card.name} image={card.image} className={styles.imageButton} />
      ) : null}
      <div className={styles.text}>
        <dl className={styles.facts}>
          {facts.map(([label = '', value = '']) => (
            <Fact key={label} label={label}>
              <GlossaryText text={value} />
            </Fact>
          ))}
          {hasTraits ? (
            <Fact label="Traits">
              <TraitList traits={card.traits} />
            </Fact>
          ) : null}
          {/* Expansion names, such as "Forcemaster vs Warlord", are not game terms. */}
          <Fact label="Expansion">{card.expansion}</Fact>
        </dl>
        {printedText.map((text) => (
          <p key={text} className={styles.effect}>
            <GlossaryText text={text} />
          </p>
        ))}
      </div>
    </div>
  );
};
