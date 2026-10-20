import { Route, Routes } from 'react-router-dom';
import { Toast } from '@/components/toast/Toast';
import { BOOK_SEGMENT } from '@/core/routing/paths';
import { Builder } from '@/features/builder/Builder';
import { MagePicker } from '@/features/mage-picker/MagePicker';
import { UrlBook } from '@/features/url-book/UrlBook';
import { Layout } from '@/layout/Layout';
import { ToPicker } from '@/layout/ToPicker';

export const App = () => (
  <>
    <Routes>
      <Route element={<Layout />}>
        <Route index={true} element={<MagePicker />} />
        <Route path=":mageSlug" element={<Builder tab="cards" />} />
        <Route path={`:mageSlug/${BOOK_SEGMENT}`} element={<Builder tab="book" />} />
        <Route path="*" element={<ToPicker />} />
      </Route>
    </Routes>
    <UrlBook />
    <Toast />
  </>
);
