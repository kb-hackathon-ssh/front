import { Outlet } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";

export default function RootLayout() {
  return (
    <>
      <Header />
      <main className="w-full pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
