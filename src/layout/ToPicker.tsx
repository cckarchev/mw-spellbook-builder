import { Navigate, useLocation } from 'react-router-dom';
import { PICKER_PATH } from '@/core/routing/paths';

/** Sends a path the app does not know to the mage picker, keeping its query, so a share link still opens. */
export const ToPicker = () => {
  const { search } = useLocation();

  return <Navigate to={{ pathname: PICKER_PATH, search }} replace={true} />;
};
