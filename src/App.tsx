import { Route, Routes } from 'react-router-dom';
import { Builder } from '@/features/builder/Builder';
import { MagePicker } from '@/features/mage-picker/MagePicker';
import { IncomingIssues } from '@/features/share/incoming-issues/IncomingIssues';
import { useIncomingBook } from '@/features/share/useIncomingBook';
import { Layout } from '@/layout/Layout';

export const App = () => {
  const { problems, dismiss } = useIncomingBook();

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index={true} element={<MagePicker />} />
          <Route path="build" element={<Builder />} />
        </Route>
      </Routes>
      <IncomingIssues problems={problems} onDismiss={dismiss} />
    </>
  );
};
