import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/features/app-header/AppHeader';
import styles from './Layout.module.css';

export const Layout = () => (
  <div className={styles.shell}>
    <AppHeader />
    <Outlet />
  </div>
);
