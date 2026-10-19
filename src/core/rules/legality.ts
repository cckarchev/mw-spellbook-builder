import { type Card, type Mage, SCHOOLS, type School } from './types';

// "Dark Mage Only" and similar: any mage trained in that school.
const SCHOOL_MAGE_PATTERN = /^(\w+) Mage$/;

const asSchool = (name: string): School | undefined => SCHOOLS.find((school) => school === name);

/** Whether the mage is trained in a school at all: fully or partially. */
export const isTrainedIn = (school: School, mage: Mage): boolean => {
  const { training } = mage;
  const isFull = training.full.includes(school);
  const isPartial = training.partial.some((partial) => partial.school === school);

  return isFull || isPartial;
};

const matchesOnlyFor = (onlyFor: string, mage: Mage): boolean => {
  const schoolMatch = SCHOOL_MAGE_PATTERN.exec(onlyFor);
  const school = schoolMatch ? asSchool(schoolMatch[1]) : undefined;

  if (school) {
    return isTrainedIn(school, mage);
  }

  return mage.onlyNames.includes(onlyFor);
};

/** Whether a card may go in this mage's spellbook at all. */
export const isLegalFor = (card: Card, mage: Mage): boolean => {
  // Arena mages may use every card; Academy mages only Academy cards.
  const fitsFormat = mage.format === 'arena' || card.format === 'academy';

  if (!fitsFormat) {
    return false;
  }

  if (card.onlyFor === null) {
    return true;
  }

  return matchesOnlyFor(card.onlyFor, mage);
};
