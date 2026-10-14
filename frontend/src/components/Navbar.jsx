import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Map, User, LogOut, Briefcase, Shield, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const mainLinks = [
  { to: "/discover", label: "Discover" },
  { to: "/experiences", label: "Experiences" },
  { to: "/stays", label: "Stays" },
  { to: "/places", label: "Places" },
  { to: "/stories", label: "Stories" },
];

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? "bg-forest text-cream" : "text-forest hover:bg-forest/5"}`;

export default function Navbar() {
  const { currentUser, isAuthenticated, isCreator, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    toast.success("You are logged out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-[900] border-b border-sand/60 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="RoamRoot home" className="flex-shrink-0">
          <img src="/images/brand/roamroot-logo.svg" alt="RoamRoot" className="h-12 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NavLink to="/saved" className={linkClass}><span className="hidden items-center gap-1 xl:inline-flex"><Heart className="h-4 w-4" aria-hidden="true" /> Saved</span><Heart className="h-5 w-5 xl:hidden" aria-label="Saved" /></NavLink>
          <NavLink to="/trips" className={linkClass}><span className="hidden items-center gap-1 xl:inline-flex"><Map className="h-4 w-4" aria-hidden="true" /> Trips</span><Map className="h-5 w-5 xl:hidden" aria-label="Trips" /></NavLink>
          <Link to="/creator/dashboard" className="btn-outline ml-2 hidden !py-2 md:inline-flex">
            {isCreator ? "Creator Studio" : "Become a Creator"}
          </Link>

          {isAuthenticated ? (
            <div className="relative ml-2">
              <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-haspopup="menu" aria-label="Open profile menu" className="rounded-full">
                <Avatar user={currentUser} size={38} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-sand bg-white p-2 shadow-lift" onClick={() => setMenuOpen(false)}>
                  <p className="truncate px-3 py-2 text-sm font-semibold text-forest">{currentUser.name}</p>
                  <Link role="menuitem" to="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-cream"><User className="h-4 w-4" aria-hidden="true" /> Profile</Link>
                  <Link role="menuitem" to="/bookings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-cream"><Ticket className="h-4 w-4" aria-hidden="true" /> My bookings</Link>
                  {isCreator && <Link role="menuitem" to="/creator/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-cream"><Briefcase className="h-4 w-4" aria-hidden="true" /> Creator Studio</Link>}
                  {isAdmin && <Link role="menuitem" to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-cream"><Shield className="h-4 w-4" aria-hidden="true" /> Admin</Link>}
                  <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-cream"><LogOut className="h-4 w-4" aria-hidden="true" /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost ml-1 !py-2">Log in</Link>
              <Link to="/register" className="btn-primary !py-2">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
