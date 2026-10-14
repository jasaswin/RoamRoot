import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import useFavorites from "../hooks/useFavorites";

export default function FavoriteButton({ listingId, className = "" }) {
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle, toggling } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const saved = isSaved(listingId);

  const handleClick = (e) => {
    e.preventDefault(); // the button sits inside a card link
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Log in to save places");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    toggle(listingId);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={toggling}
      whileTap={{ scale: 0.85 }}
      animate={{ scale: saved ? [1, 1.25, 1] : 1 }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save this place"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-forest shadow-card backdrop-blur transition hover:bg-white ${className}`}
    >
      <Heart className={`h-5 w-5 ${saved ? "fill-terracotta text-terracotta" : ""}`} aria-hidden="true" />
    </motion.button>
  );
}
