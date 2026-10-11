import { NavLink } from "react-router-dom";
import Icon from "./Icon.jsx";
import { navItems } from "./Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Bottom tab bar, phones only (Alerts are reached from the bell in the top bar)
const mobileItems = [navItems[0], navItems[1], navItems[2], { to: "/app/pro", icon: "star", label: "Go Pro" }, navItems[4]];
export default function MobileNav() {
  const { user } = useAuth();
  const items = user?.role === "ADMIN" ? [mobileItems[0], mobileItems[1], mobileItems[2], { to: "/app/admin", icon: "shield", label: "Admin" }, mobileItems[4]] : mobileItems;
  return (
    <nav className="pb-safe fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-line bg-side/95 backdrop-blur md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          aria-label={item.label}
          className={({ isActive }) => "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] " + (isActive ? "text-brand" : "text-muted")}
        >
          <Icon name={item.icon} size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
