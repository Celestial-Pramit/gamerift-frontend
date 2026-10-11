import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "./Icon.jsx";
import Brand from "./Brand.jsx";
import NotifBell from "./NotifBell.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    navigate("/app/discover?q=" + encodeURIComponent(query));
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-line bg-side/90 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-4">
      <Link to="/app" className="md:hidden"><Brand className="text-lg" /></Link>
      <form onSubmit={handleSearch} className="relative hidden max-w-md flex-1 sm:block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icon name="search" size={16} /></span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search streams, channels, tags..."
          className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-neon"
        />
      </form>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link to="/app/discover" aria-label="Search" className="grid h-10 w-10 place-items-center text-muted sm:hidden"><Icon name="search" /></Link>
        {user?.role === "ADMIN" && <Link to="/app/admin" aria-label="Admin panel" className="grid h-10 w-10 place-items-center rounded-lg border border-gold/50 bg-gold/10 text-gold md:hidden"><Icon name="shield" size={18} /></Link>}
        {user?.role === "ADMIN" && (
          <button className="btn-cut btn-pri hidden px-4 py-2 text-sm lg:inline-flex"><Icon name="radio" size={16} /> Go live</button>
        )}
        <NotifBell />
        <button onClick={handleLogout} aria-label="Logout" title="Logout" className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-card text-muted hover:text-white">
          <Icon name="logout" size={18} />
        </button>
      </div>
    </header>
  );
}
