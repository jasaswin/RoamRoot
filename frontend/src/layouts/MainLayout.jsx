import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import AIAssistant from "../components/AIAssistant";

// Shows a banner when the internet connection drops
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  if (online) return null;
  return (
    <div role="alert" className="flex items-center justify-center gap-2 bg-terracotta px-4 py-2 text-sm font-medium text-white">
      <WifiOff className="h-4 w-4" aria-hidden="true" /> You are offline. Some things may not load until you reconnect.
    </div>
  );
}

export default function MainLayout() {
  const location = useLocation();

  // go to the top of the page when the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <OfflineBanner />
      <Navbar />
      <motion.main id="main" key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex-1">
        <Outlet />
      </motion.main>
      <Footer />
      <MobileBottomNav />
      <AIAssistant />
    </div>
  );
}
