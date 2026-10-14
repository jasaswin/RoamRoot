import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../../components/Seo";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import Rating from "../../components/Rating";
import { Skeleton } from "../../components/Skeleton";
import { getCreatorListings } from "../../services/creatorApi";
import { deleteListing } from "../../services/listingApi";
import { firstImage, formatPrice, typeLabel } from "../../lib/format";

export default function CreatorListingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["creator", "listings"], queryFn: getCreatorListings });
  const remove = useMutation({
    mutationFn: (l) => deleteListing(l._id),
    onSuccess: () => { toast.success("Listing deleted"); queryClient.invalidateQueries({ queryKey: ["creator"] }); queryClient.invalidateQueries({ queryKey: ["listings"] }); },
    onError: (e) => toast.error(e.message),
  });
  const listings = data?.listings || [];

  return (
    <div>
      <Seo title="Your listings" />
      <div className="mb-6 flex items-center justify-between"><h2 className="text-3xl">Your listings</h2><Link to="/creator/listings/new" className="btn-accent"><Plus className="h-4 w-4" aria-hidden="true" /> New listing</Link></div>
      {isLoading ? <Skeleton className="h-64 w-full" /> : isError ? <ErrorState message={error.message} onRetry={refetch} /> : listings.length === 0 ? (
        <EmptyState image="/images/creators/roamroot-creator.svg" title="Share your first place." text="Create a listing for a stay, experience or hidden gem." actionLabel="Create a listing" actionTo="/creator/listings/new" />
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li key={l._id} className="card flex flex-wrap items-center gap-4 p-3">
              <img src={firstImage(l, 200)} alt="" className="h-20 w-24 rounded-xl object-cover" loading="lazy" />
              <div className="min-w-0 flex-1"><p className="truncate font-serif text-lg font-semibold text-forest">{l.title}</p><p className="text-sm text-muted">{typeLabel(l.type)} · {l.location} · {formatPrice(l.price)}</p><div className="mt-1 flex items-center gap-3 text-xs text-muted"><Rating value={l.rating} count={l.reviewCount} /><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" aria-hidden="true" /> {l.views}</span></div></div>
              <div className="flex gap-1">
                <Link to={`/listings/${l._id}`} className="btn-ghost !px-3">View</Link>
                <Link to={`/creator/listings/${l._id}/edit`} className="btn-outline !px-3" aria-label={`Edit ${l.title}`}><Pencil className="h-4 w-4" aria-hidden="true" /></Link>
                <button type="button" onClick={() => window.confirm(`Delete "${l.title}"? Its reviews and bookings will be removed too.`) && remove.mutate(l)} aria-label={`Delete ${l.title}`} className="btn-outline !px-3 !text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
