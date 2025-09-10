import { Outlet } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';

export default function RootLayout() {
  return (
    <>
      <Header />
      <ScrollToTop />
      <main className="w-full pt-24">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
