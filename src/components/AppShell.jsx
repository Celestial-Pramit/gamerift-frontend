import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import Ticker from "./Ticker.jsx";
import MobileNav from "./MobileNav.jsx";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-14 md:pb-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
        <Ticker />
      </div>
      <MobileNav />
    </div>
  );
}
