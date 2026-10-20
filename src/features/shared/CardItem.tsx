import type { ComponentProps } from 'react';
import { CardRow } from './card-row/CardRow';
import { CardTile } from './card-tile/CardTile';
import type { ViewMode } from './view-switch/useViewMode';

type CardItemProps = ComponentProps<typeof CardRow> & {
  view: ViewMode;
};

/** A card as a row in the list view, or as a tile in the grid view. */
export const CardItem = ({ view, ...props }: CardItemProps) => {
  if (view === 'grid') {
    return <CardTile {...props} />;
  }

  return <CardRow {...props} />;
};
