import { Route, Routes } from 'react-router-dom';
import { Builder } from '@/features/builder/Builder';
import { MagePicker } from '@/features/mage-picker/MagePicker';
import { IncomingLink } from '@/features/share/IncomingLink';
import { Layout } from '@/layout/Layout';

export const App = () => (
  <>
    <Routes>
      <Route element={<Layout />}>
        <Route index={true} element={<MagePicker />} />
        <Route path="build" element={<Builder />} />
      </Route>
    </Routes>
    <IncomingLink />
  </>
);
