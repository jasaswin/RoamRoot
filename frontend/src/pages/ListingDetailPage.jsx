import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Users, Clock, Check, CalendarPlus, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import ImageGallery from "../components/ImageGallery";
import Rating from "../components/Rating";
import FavoriteButton from "../components/FavoriteButton";
import ShareButton from "../components/ShareButton";
import BookingPanel from "../components/BookingPanel";
import MapView from "../components/MapView";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import ListingCard from "../components/ListingCard";
import AddToTripModal from "../components/AddToTripModal";
import Avatar from "../components/Avatar";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { getListing } from "../services/listingApi";
import { getReviews, deleteReview } from "../services/reviewApi";
import { typeLabel, durationLabel, firstImage } from "../lib/format";

export default function ListingDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [tripOpen, setTripOpen] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const listingQuery = useQuery({ queryKey: ["listing", id], queryFn: () => getListing(id) });
  const reviewsQuery = useQuery({ queryKey: ["reviews", id], queryFn: () => getReviews(id, { limit: 20 }) });

  const removeReview = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (listingQuery.isLoading) {
    return <div className="container-page space-y-4 py-8"><Skeleton className="h-[460px] w-full" /><Skeleton className="h-10 w-2/3" /><Skeleton className="h-40 w-full" /></div>;
  }
  if (listingQuery.isError) {
    return <div className="container-page py-20"><ErrorState message={listingQuery.error.message} onRetry={listingQuery.refetch} /></div>;
  }

  const { listing, related } = listingQuery.data;
  const reviews = reviewsQuery.data?.items || [];
  const isOwner = currentUser?._id === listing.creator?._id;
  const alreadyReviewed = reviews.some((r) => r.user?._id === currentUser?._id);
  const relatedExperiences = related.filter((l) => l.type !== "STAY" && l.type !== "PLACE");
  const relatedPlaces = related.filter((l) => l.type === "PLACE" || l.type === "STAY");

  return (
    <>
      <Seo title={listing.title} description={listing.description.slice(0, 155)} image={firstImage(listing, 1200)} />
      <div className="container-page py-8">
        <ImageGallery images={listing.images} title={listing.title} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{typeLabel(listing.type)} · {listing.category}</p>
                <h1 className="mt-2 text-4xl sm:text-5xl">{listing.title}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" /> {listing.location}</span>
                  <Rating value={listing.rating} count={listing.reviewCount} />
                  <span className="inline-flex items-center gap-1 text-sm"><Eye className="h-4 w-4" aria-hidden="true" /> {listing.views.toLocaleString("en-IN")} views</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ShareButton title={listing.title} />
                <FavoriteButton listingId={listing._id} className="!h-11 !w-11 border border-sand" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-y border-sand py-5 text-sm">
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-terracotta" aria-hidden="true" /> Up to {listing.capacity} guests</span>
              {listing.durationHours > 0 && <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-terracotta" aria-hidden="true" /> {durationLabel(listing.durationHours)}</span>}
              {isAuthenticated && (
                <button type="button" onClick={() => setTripOpen(true)} className="ml-auto inline-flex items-center gap-2 font-semibold text-forest hover:underline"><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to a trip</button>
              )}
            </div>

            {/* Creator */}
            {listing.creator && (
              <Link to={`/creators/${listing.creator._id}`} className="mt-6 flex items-center gap-4 rounded-2xl p-2 hover:bg-white">
                <Avatar user={listing.creator} size={56} />
                <div><p className="text-sm text-muted">Hosted by</p><p className="font-serif text-xl font-semibold text-forest">{listing.creator.name}</p></div>
              </Link>
            )}

            <section className="mt-8"><h2 className="text-2xl">About this {typeLabel(listing.type).toLowerCase()}</h2><p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-charcoal/85">{listing.description}</p></section>

            {listing.highlights?.length > 0 && (
              <section className="mt-8"><h2 className="text-2xl">Highlights</h2>
                <ul className="mt-3 space-y-2">{listing.highlights.map((h) => <li key={h} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-sage" aria-hidden="true" />{h}</li>)}</ul>
              </section>
            )}

            {listing.amenities?.length > 0 && (
              <section className="mt-8"><h2 className="text-2xl">What's included</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">{listing.amenities.map((a) => <li key={a} className="rounded-xl bg-white px-4 py-2.5 text-sm">{a}</li>)}</ul>
              </section>
            )}

            <section className="mt-8"><h2 className="mb-3 text-2xl">Where you'll be</h2>
              <MapView listings={[listing]} className="h-72" />
              <p className="mt-2 text-sm text-muted">{listing.location}, {listing.country}</p>
            </section>

            <section className="mt-12" aria-label="Reviews">
              <h2 className="text-2xl">Reviews {listing.reviewCount > 0 && <span className="font-sans text-base font-normal text-muted">· {listing.rating.toFixed(1)} from {listing.reviewCount}</span>}</h2>
              {reviewsQuery.isLoading ? <Skeleton className="mt-4 h-32 w-full" /> : reviews.length === 0 ? <p className="mt-3 text-muted">No reviews yet. Be the first to share your experience.</p> : (
                <div className="mt-2">{reviews.map((r) => <ReviewCard key={r._id} review={r} canDelete={currentUser && (r.user?._id === currentUser._id || currentUser.role === "ADMIN")} onDelete={() => removeReview.mutate(r._id)} />)}</div>
              )}
              <div className="mt-6">
                {!isAuthenticated ? <p className="text-muted"><Link to="/login" state={{ from: `/listings/${id}` }} className="font-semibold text-forest underline">Log in</Link> to write a review.</p>
                  : isOwner ? <p className="text-muted">You can't review your own listing.</p>
                  : alreadyReviewed ? <p className="text-muted">Thanks, you have already reviewed this listing.</p>
                  : <ReviewForm listingId={id} />}
              </div>
            </section>
          </div>

          <div><BookingPanel listing={listing} defaultDate={searchParams.get("date") || ""} /></div>
        </div>

        {relatedExperiences.length > 0 && (
          <section className="mt-16"><h2 className="mb-5 text-3xl">Related experiences</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{relatedExperiences.map((l) => <ListingCard key={l._id} listing={l} />)}</div></section>
        )}
        {relatedPlaces.length > 0 && (
          <section className="mt-16"><h2 className="mb-5 text-3xl">Related places and stays</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{relatedPlaces.map((l) => <ListingCard key={l._id} listing={l} />)}</div></section>
        )}
      </div>
      <AddToTripModal open={tripOpen} onClose={() => setTripOpen(false)} listing={listing} />
    </>
  );
}
