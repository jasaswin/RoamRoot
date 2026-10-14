import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, List, CalendarCheck, BarChart3, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CreatorOnboarding from "../components/CreatorOnboarding";

const tabs = [
  { to: "/creator/dashboard", label: "Overview", Icon: LayoutDashboard },
  { to: "/creator/listings", label: "Listings", Icon: List },
  { to: "/creator/bookings", label: "Bookings", Icon: CalendarCheck },
  { to: "/creator/analytics", label: "Analytics", Icon: BarChart3 },
  { to: "/profile", label: "Profile", Icon: User },
];

// Wraps all creator pages. Normal users first see the "Become a Creator" screen.
export default function CreatorLayout() {
  const { isCreator, currentUser } = useAuth();
  if (!isCreator) return <CreatorOnboarding />;

  return (
    <div className="container-page py-8">
      <p className="eyebrow">Creator Studio</p>
      <h1 className="text-3xl sm:text-4xl">Welcome back, {currentUser.name.split(" ")[0]}</h1>
      <nav aria-label="Creator" className="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-sand pb-3">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isActive ? "bg-forest text-cream" : "text-forest hover:bg-forest/5"}`}>
            <Icon className="h-4 w-4" aria-hidden="true" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8"><Outlet /></div>
    </div>
  );
}
