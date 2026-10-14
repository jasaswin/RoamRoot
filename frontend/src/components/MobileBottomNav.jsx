import { NavLink } from "react-router-dom";
import { Home, Compass, Map, Heart, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const items = [
    { to: "/", label: "Home", Icon: Home, end: true },
    { to: "/discover", label: "Discover", Icon: Compass },
    { to: "/trips", label: "Trips", Icon: Map },
    { to: "/saved", label: "Saved", Icon: Heart },
    { to: isAuthenticated ? "/profile" : "/login", label: "Profile", Icon: User },
  ];
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-[900] border-t border-sand bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="flex">
        {items.map(({ to, label, Icon, end }) => (
          <li key={label} className="flex-1">
            <NavLink to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? "text-terracotta" : "text-muted"}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
