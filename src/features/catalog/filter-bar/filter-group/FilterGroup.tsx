import { Chip } from '@/components/chip/Chip';
import type { FilterValue } from '../../useCatalogFilters';
import styles from './FilterGroup.module.css';

interface FilterGroupProps {
  title: string;
  options: FilterValue[];
  selected: FilterValue[];
  onToggle: (value: FilterValue) => void;
}

/** One filter's chips under its title. Renders nothing when there is nothing to pick. */
export const FilterGroup = ({ title, options, selected, onToggle }: FilterGroupProps) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.title}>{title}</legend>
      <div className={styles.chips}>
        {options.map((option) => (
          <Chip key={option} selected={selected.includes(option)} onToggle={() => onToggle(option)}>
            {option}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
};
