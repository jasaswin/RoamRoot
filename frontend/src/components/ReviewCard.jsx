import { Star, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { formatDate } from "../lib/format";

export default function ReviewCard({ review, canDelete, onDelete }) {
  return (
    <article className="border-b border-sand/70 py-5 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar user={review.user} size={40} />
        <div className="flex-1">
          <p className="font-semibold text-charcoal">{review.user?.name || "Traveller"}</p>
          <p className="text-xs text-muted">{formatDate(review.createdAt, "MMMM yyyy")}</p>
        </div>
        <div className="flex" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={`h-4 w-4 ${n <= review.rating ? "fill-terracotta text-terracotta" : "text-sand"}`} aria-hidden="true" />
          ))}
        </div>
        {canDelete && (
          <button type="button" onClick={onDelete} aria-label="Delete review" className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
        )}
      </div>
      {review.title && <h4 className="mt-3 font-sans text-base font-semibold text-forest">{review.title}</h4>}
      <p className="mt-1 text-charcoal/80">{review.comment}</p>
    </article>
  );
}
