import { NavLink, Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import Avatar from "./Avatar.jsx";
import Brand from "./Brand.jsx";
import { useEffect, useState } from "react";
import { getChannels } from "../api/channelApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export const navItems = [
  { to: "/app", icon: "home", label: "Dashboard", end: true },
  { to: "/app/discover", icon: "compass", label: "Discover" },
  { to: "/app/events", icon: "cal", label: "Events" },
  { to: "/app/notifications", icon: "bell", label: "Alerts" },
  { to: "/app/settings", icon: "sliders", label: "Settings" },
];

// Section title (desktop) or a thin divider (icon rail)
function Label({ text }) {
  return (
    <>
      <div className="mono mb-1 mt-5 hidden px-3 text-[10px] text-muted xl:block">{text}</div>
      <div className="mx-auto my-3 h-px w-8 bg-line xl:hidden" />
    </>
  );
}

// Same item: a square icon tile on tablets, a full row on desktop
function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        "mx-auto flex h-11 w-11 items-center justify-center gap-3 rounded-xl font-head text-lg transition xl:mx-0 xl:h-auto xl:w-auto xl:justify-start xl:px-3 xl:py-2.5 " +
        (isActive ? "bg-brand/20 text-white ring-1 ring-brand/60" : "text-muted hover:bg-white/5 hover:text-white")
      }
    >
      <Icon name={icon} />
      <span className="hidden xl:inline">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);

  // Load the channels this user follows; reload when the user follows or unfollows somewhere
  useEffect(() => {
    function load() {
      getChannels().then((list) => setFollowing(list.filter((c) => c.following))).catch(() => {});
    }
    load();
    window.addEventListener("gr-follow-changed", load);
    return () => window.removeEventListener("gr-follow-changed", load);
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col overflow-y-auto border-r border-line bg-side px-3 py-4 md:flex xl:w-72">
      <Link to="/app" className="mb-5 flex justify-center xl:justify-start xl:px-2">
        <span className="xl:hidden"><Brand text="G" className="text-2xl" /></span>
        <span className="hidden xl:inline-block"><Brand className="text-lg" /></span>
      </Link>
      <nav className="flex flex-col gap-1.5">
        {navItems.filter((n) => ["Dashboard", "Discover", "Events"].includes(n.label)).map((item) => <NavItem key={item.to} {...item} />)}

        <Label text="FOLLOWING" />
        {following.slice(0, 4).map((c) => (
          <Link key={c.id} to={"/app/discover?q=" + c.name} title={c.name} className="mx-auto flex h-11 w-11 items-center justify-center gap-3 rounded-xl hover:bg-white/5 xl:mx-0 xl:h-auto xl:w-auto xl:justify-start xl:px-3 xl:py-2">
            <span className="relative">
              <Avatar name={c.name} size={30} />
              {c.live && <span className="livedot absolute -right-0.5 -top-0.5" />}
            </span>
            <span className="hidden min-w-0 flex-1 truncate text-sm xl:block">{c.name}</span>
            {c.pro && <span className="tag tag-pro hidden xl:inline-flex">PRO</span>}
          </Link>
        ))}

        <Label text="OTHER" />
        {navItems.filter((n) => ["Alerts", "Settings"].includes(n.label)).map((item) => <NavItem key={item.to} {...item} />)}
        <NavItem to="/app/pro" icon="star" label="Go Pro" />

        {user?.role === "ADMIN" && (
          <>
            <Label text="ADMIN" />
            <NavItem to="/app/admin" icon="shield" label="Admin panel" />
          </>
        )}
      </nav>
      <div className="mt-auto flex items-center justify-center gap-3 rounded-xl border border-line bg-card p-2 xl:justify-start">
        <Avatar name={user?.username || "u"} size={32} />
        <div className="hidden min-w-0 xl:block">
          <div className="truncate text-sm font-bold">{user?.username}</div>
          <div className="mono text-[10px] text-muted">{user?.role}</div>
        </div>
      </div>
    </aside>
  );
}
