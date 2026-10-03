import { NavLink, Link } from "react-router-dom";

export const navItems = [
  { to: "/app", icon: "🏠", label: "Dashboard", end: true },
  { to: "/app/discover", icon: "🧭", label: "Discover" },
  { to: "/app/trending", icon: "🔥", label: "Trending" },
  { to: "/app/events", icon: "📅", label: "Events" },
  { to: "/app/chat", icon: "💬", label: "Chat" },
  { to: "/app/settings", icon: "⚙️", label: "Settings" },
  { to: "/app/pro", icon: "⭐", label: "Go Pro" },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col border-r border-line bg-side p-3 md:flex xl:w-72">
      <Link to="/app" className="glitch mb-6 px-2 font-display text-lg">
        <span className="xl:hidden">G</span>
        <span className="hidden xl:inline">GAMERIFT</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2.5 font-head text-lg " +
              (isActive ? "border-l-2 border-brand bg-brand/20 text-white" : "text-muted hover:text-white")
            }
          >
            <span>{item.icon}</span>
            <span className="hidden xl:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
