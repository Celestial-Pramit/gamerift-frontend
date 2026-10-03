import { NavLink } from "react-router-dom";
import { navItems } from "./Sidebar.jsx";

// Bottom tab bar, phones only
export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-line bg-side py-2 md:hidden">
      {navItems.slice(0, 5).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          aria-label={item.label}
          className={({ isActive }) => "px-3 py-1 text-xl " + (isActive ? "rounded bg-brand/20" : "opacity-60")}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
}
