import { useNavigate } from 'react-router-dom';
import { builderPath } from '@/core/routing/builderPath';
import type { Mage } from '@/core/rules/types';
import { useBookStore } from '@/store/useBookStore';

/** Opens the builder on the mage's draft; the book left behind stays as its own mage's draft. */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const openMage = useBookStore((state) => state.openMage);

  const selectMage = (mage: Mage) => {
    openMage(mage.id);
    navigate(builderPath(mage.name, 'cards'));
  };

  return { book, selectMage };
};
