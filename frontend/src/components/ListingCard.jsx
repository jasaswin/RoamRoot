import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import Rating from "./Rating";
import FavoriteButton from "./FavoriteButton";
import { firstImage, formatPrice, priceUnit, typeLabel, durationLabel } from "../lib/format";

// variant "portrait" (experiences, places) is tall. variant "landscape" (stays) is wide.
export default function ListingCard({ listing, variant = "portrait", active = false, onHover, search = "" }) {
  const isGem = listing.tags?.includes("hidden-gem");
  const aspect = variant === "landscape" ? "aspect-[4/3]" : "aspect-[4/5]";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      onMouseEnter={() => onHover?.(listing._id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative rounded-3xl transition ${active ? "ring-2 ring-terracotta ring-offset-4 ring-offset-cream" : ""}`}
    >
      <Link to={`/listings/${listing._id}${search}`} className="block rounded-3xl focus-visible:outline-offset-4">
        <div className={`relative overflow-hidden rounded-3xl ${aspect}`}>
          <img
            src={firstImage(listing, 600)}
            alt={`${listing.title} in ${listing.location}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-deep/50 to-transparent" aria-hidden="true" />
          <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-forest">
            {isGem ? "Hidden gem" : typeLabel(listing.type)}
          </span>
        </div>
        <div className="mt-3 px-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-lg font-semibold leading-snug text-forest">{listing.title}</h3>
            <Rating value={listing.rating} count={listing.reviewCount} className="flex-shrink-0 pt-0.5" />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{listing.location}</span>
          </p>
          <p className="mt-1 flex items-center gap-3 text-sm text-charcoal">
            <span>
              <strong>{formatPrice(listing.price)}</strong>
              {listing.price > 0 && <span className="text-muted"> / {priceUnit(listing.type)}</span>}
            </span>
            {listing.durationHours > 0 && (
              <span className="inline-flex items-center gap-1 text-muted">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {durationLabel(listing.durationHours)}
              </span>
            )}
          </p>
        </div>
      </Link>
      <FavoriteButton listingId={listing._id} className="absolute right-3 top-3" />
    </motion.article>
  );
}
