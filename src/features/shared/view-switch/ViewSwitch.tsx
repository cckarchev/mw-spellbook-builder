import { Segmented, type SegmentedOption } from '@/components/segmented/Segmented';
import type { ViewMode } from './useViewMode';
import { GridIcon, ListIcon } from './ViewIcons';

const VIEWS: SegmentedOption<ViewMode>[] = [
  { value: 'list', label: 'List', icon: <ListIcon /> },
  { value: 'grid', label: 'Grid', icon: <GridIcon /> },
];

interface ViewSwitchProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

/** Picks between card rows and card images. */
export const ViewSwitch = ({ view, onChange }: ViewSwitchProps) => (
  <Segmented label="View" options={VIEWS} value={view} onChange={onChange} />
);
