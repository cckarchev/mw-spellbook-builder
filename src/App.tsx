import { Navigate, Route, Routes } from 'react-router-dom';
import { Toast } from '@/components/toast/Toast';
import { PICKER_PATH, SPELLBOOK_SEGMENT } from '@/core/routing/builderPath';
import { Builder } from '@/features/builder/Builder';
import { MagePicker } from '@/features/mage-picker/MagePicker';
import { IncomingLink } from '@/features/share/IncomingLink';
import { Layout } from '@/layout/Layout';

export const App = () => (
  <>
    <Routes>
      <Route element={<Layout />}>
        <Route index={true} element={<MagePicker />} />
        <Route path=":mageSlug" element={<Builder tab="cards" />} />
        <Route path={`:mageSlug/${SPELLBOOK_SEGMENT}`} element={<Builder tab="spellbook" />} />
        <Route path="*" element={<Navigate to={PICKER_PATH} replace={true} />} />
      </Route>
    </Routes>
    <IncomingLink />
    <Toast />
  </>
);
