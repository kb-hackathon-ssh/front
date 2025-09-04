import { Outlet } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

export default function RootLayout() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-screen-xl px-4 pt-20 pb-6 flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
