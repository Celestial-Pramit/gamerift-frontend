import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import Ticker from "./Ticker.jsx";
import MobileNav from "./MobileNav.jsx";
import ToastHost from "./ToastHost.jsx";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <Topbar />
        <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
        <Ticker />
      </div>
      <MobileNav />
      <ToastHost />
    </div>
  );
}
