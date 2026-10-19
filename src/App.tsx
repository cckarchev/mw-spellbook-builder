import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/layout/Layout';

const Home = () => <h1>Mage Wars Spellbook Builder</h1>;

export const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index={true} element={<Home />} />
    </Route>
  </Routes>
);
