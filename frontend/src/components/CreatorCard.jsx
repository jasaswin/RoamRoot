import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Avatar from "./Avatar";

export default function CreatorCard({ creator }) {
  return (
    <Link to={`/creators/${creator._id}`} className="card flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-lift">
      <Avatar user={creator} size={64} />
      <h3 className="mt-4 text-xl">{creator.name}</h3>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {creator.location}</p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm text-charcoal/80">{creator.bio}</p>
      <p className="mt-4 text-sm font-semibold text-terracotta">{creator.listingCount} listing{creator.listingCount === 1 ? "" : "s"}</p>
    </Link>
  );
}
