export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as RootLayout } from './RootLayout';

import { Outlet } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

export default function RootLayout() {
  return (
    <>
      <Header />
      <main className="w-full pt-24">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
