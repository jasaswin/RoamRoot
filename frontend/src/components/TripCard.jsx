import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Trash2 } from "lucide-react";
import { imageUrl, formatDate, formatPrice, daysBetween } from "../lib/format";

export default function TripCard({ trip, onDelete }) {
  const days = daysBetween(trip.startDate, trip.endDate);
  return (
    <article className="group card relative overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/trips/${trip._id}`} className="block">
        <div className="relative h-44 overflow-hidden bg-sage-light">
          {trip.coverImage && <img src={imageUrl(trip.coverImage, 700)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/60 to-transparent" aria-hidden="true" />
          <h3 className="absolute bottom-3 left-4 right-4 font-serif text-2xl !text-cream">{trip.name}</h3>
        </div>
        <div className="space-y-1.5 p-4 text-sm text-charcoal/80">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-terracotta" aria-hidden="true" /> {trip.destination}</p>
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-terracotta" aria-hidden="true" /> {formatDate(trip.startDate, "d MMM")} to {formatDate(trip.endDate, "d MMM yyyy")} ({days} day{days > 1 ? "s" : ""})</p>
          <p className="text-muted">{trip.itemCount ?? 0} planned item{trip.itemCount === 1 ? "" : "s"}{trip.budget ? ` · Budget ${formatPrice(trip.budget)}` : ""}</p>
        </div>
      </Link>
      {onDelete && (
        <button type="button" onClick={() => onDelete(trip)} aria-label={`Delete ${trip.name}`} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-muted shadow-card hover:text-red-600"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
      )}
    </article>
  );
}
