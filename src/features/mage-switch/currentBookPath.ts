import { type BuilderTab, builderPath } from '@/core/routing/builderPath';
import type { Book } from '@/core/rules/types';
import { magesById } from '@/data/catalog';

const PICKER_PATH = '/';

/** Where the book already lives: its mage's builder, or the mage picker when it has no mage. */
export const currentBookPath = (book: Book, tab: BuilderTab): string => {
  const mage = book.mageId === null ? undefined : magesById.get(book.mageId);

  if (!mage) {
    return PICKER_PATH;
  }

  return builderPath(mage.name, tab);
};
