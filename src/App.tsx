import { Route, Routes } from 'react-router-dom';
import { MagePicker } from '@/features/mage-picker/MagePicker';
import { Layout } from '@/layout/Layout';

// Placeholder until the build screen lands.
const Build = () => <h1>Build</h1>;

export const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index={true} element={<MagePicker />} />
      <Route path="build" element={<Build />} />
    </Route>
  </Routes>
);
