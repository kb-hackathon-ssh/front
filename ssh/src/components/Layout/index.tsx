import { Outlet } from "react-router-dom";
import Header from "@/components/Layout/Header";

export default function RootLayout() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-screen-xl px-4 py-6">
        <Outlet />
      </main>
    </>
  );
}
