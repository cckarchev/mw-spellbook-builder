import type { ReactNode } from 'react';
import { Segmented } from '@/components/segmented/Segmented';
import type { CatalogView } from './useCatalogView';
import { GridIcon, ListIcon } from './ViewIcons';

const VIEWS: { value: CatalogView; label: string; icon: ReactNode }[] = [
  { value: 'list', label: 'List', icon: <ListIcon /> },
  { value: 'grid', label: 'Grid', icon: <GridIcon /> },
];

interface ViewSwitchProps {
  view: CatalogView;
  onChange: (view: CatalogView) => void;
}

/** Picks between the catalog rows and the card images. */
export const ViewSwitch = ({ view, onChange }: ViewSwitchProps) => (
  <Segmented label="View" options={VIEWS} value={view} onChange={onChange} />
);
