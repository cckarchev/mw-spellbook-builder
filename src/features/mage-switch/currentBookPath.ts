import { type BuilderTab, builderPath, PICKER_PATH } from '@/core/routing/builderPath';
import type { Book } from '@/core/rules/types';
import { bookMage } from '@/data/catalog';

/** Where the book already lives: its mage's builder, or the mage picker when it has no mage. */
export const currentBookPath = (book: Book, tab: BuilderTab): string => {
  const mage = bookMage(book);

  if (!mage) {
    return PICKER_PATH;
  }

  return builderPath(mage.name, tab);
};
