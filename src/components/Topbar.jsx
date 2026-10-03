import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./ui/Button.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="flex items-center gap-3 border-b border-line bg-side px-4 py-3">
      <span className="font-display text-lg text-brand md:hidden">GAMERIFT</span>
      <input
        placeholder="Search streams, channels..."
        className="hidden w-full max-w-md rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus:border-neon sm:block"
      />
      <div className="ml-auto flex items-center gap-3">
        {user?.role === "ADMIN" && <Button className="hidden sm:block">GO LIVE</Button>}
        <button title="Notifications" className="relative text-xl">
          🔔
          <span className="absolute -right-1 -top-1 rounded-full bg-brand px-1 text-[10px]">2</span>
        </button>
        <span className="hidden text-sm sm:inline">{user?.username}</span>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}
