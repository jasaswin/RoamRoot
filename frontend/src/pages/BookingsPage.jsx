import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { getBookings, updateBooking, deleteBooking } from "../services/bookingApi";
import { formatDate, formatPrice, firstImage } from "../lib/format";

export const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sage-light text-forest",
  CANCELLED: "bg-red-100 text-red-700",
  COMPLETED: "bg-sand text-charcoal",
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["bookings"], queryFn: getBookings });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["bookings"] });
  const cancel = useMutation({ mutationFn: (b) => updateBooking(b._id, "CANCELLED"), onSuccess: () => { toast.success("Booking cancelled"); refresh(); }, onError: (e) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: (b) => deleteBooking(b._id), onSuccess: () => { toast.success("Removed from your list"); refresh(); }, onError: (e) => toast.error(e.message) });
  const bookings = data?.bookings || [];

  return (
    <div className="container-page max-w-4xl py-10">
      <Seo title="My bookings" />
      <p className="eyebrow">Your journeys</p>
      <h1 className="text-4xl sm:text-5xl">My bookings</h1>
      <p className="mt-2 text-sm text-muted">Demo bookings only. No payment is taken.</p>

      <div className="mt-8 space-y-4">
        {isLoading ? [1, 2, 3].map((n) => <Skeleton key={n} className="h-32" />) : isError ? <ErrorState message={error.message} onRetry={refetch} /> : bookings.length === 0 ? (
          <EmptyState image="/images/empty-states/empty-bookings.svg" title="No journeys booked yet." text="When you book a stay or experience it will appear here." actionLabel="Find your first adventure" actionTo="/discover" />
        ) : bookings.map((b) => (
          <article key={b._id} className="card flex flex-col gap-4 p-4 sm:flex-row">
            {b.listing && <img src={firstImage(b.listing, 300)} alt="" className="h-32 w-full rounded-2xl object-cover sm:w-44" loading="lazy" />}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                <span className="text-xs text-muted">Ref {b.bookingReference}</span>
              </div>
              <h2 className="mt-2 text-xl">{b.listing ? <Link to={`/listings/${b.listing._id}`} className="hover:underline">{b.listing.title}</Link> : "Listing removed"}</h2>
              <p className="text-sm text-muted">{formatDate(b.checkIn)}{b.listing?.type === "STAY" ? ` to ${formatDate(b.checkOut)}` : ""} · {b.guests} guest{b.guests > 1 ? "s" : ""}</p>
              <p className="mt-1 font-semibold text-forest">{formatPrice(b.totalPrice)}</p>
              <div className="mt-3 flex gap-2">
                {(b.status === "PENDING" || b.status === "CONFIRMED") && <button type="button" onClick={() => window.confirm("Cancel this booking?") && cancel.mutate(b)} className="btn-outline !py-1.5">Cancel booking</button>}
                {b.status === "CANCELLED" && <button type="button" onClick={() => remove.mutate(b)} className="btn-ghost !py-1.5">Remove</button>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
