import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Seo from "../../components/Seo";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";
import { getCreatorBookings } from "../../services/creatorApi";
import { updateBooking } from "../../services/bookingApi";
import { formatDate, formatPrice } from "../../lib/format";
import { STATUS_STYLES } from "../BookingsPage";

export default function CreatorBookingsPage() {
  const [filter, setFilter] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["creator", "bookings"], queryFn: getCreatorBookings });
  const change = useMutation({
    mutationFn: ({ id, status }) => updateBooking(id, status),
    onSuccess: () => { toast.success("Booking updated"); queryClient.invalidateQueries({ queryKey: ["creator"] }); },
    onError: (e) => toast.error(e.message),
  });
  const all = data?.bookings || [];
  const bookings = filter ? all.filter((b) => b.status === filter) : all;

  return (
    <div>
      <Seo title="Bookings" />
      <h2 className="text-3xl">Bookings</h2>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => <button key={s} type="button" onClick={() => setFilter(s)} aria-pressed={filter === s} className={`chip ${filter === s ? "chip-active" : ""}`}>{s || "All"}</button>)}
      </div>
      <div className="mt-6">
        {isLoading ? <Skeleton className="h-64 w-full" /> : isError ? <ErrorState message={error.message} onRetry={refetch} /> : bookings.length === 0 ? (
          <EmptyState image="/images/empty-states/empty-bookings.svg" title="No bookings here yet." text="When travellers book your listings they will show up in this list." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-sand text-muted"><tr><th className="p-4">Guest</th><th className="p-4">Listing</th><th className="p-4">Dates</th><th className="p-4">Guests</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-sand/50 last:border-0">
                    <td className="p-4"><p className="font-medium">{b.user?.name}</p><p className="text-xs text-muted">{b.bookingReference}</p></td>
                    <td className="p-4">{b.listing?.title}</td>
                    <td className="p-4">{formatDate(b.checkIn, "d MMM yyyy")}{b.listing?.type === "STAY" && ` to ${formatDate(b.checkOut, "d MMM")}`}</td>
                    <td className="p-4">{b.guests}</td><td className="p-4">{formatPrice(b.totalPrice)}</td>
                    <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>{b.status}</span></td>
                    <td className="p-4"><div className="flex gap-1">
                      {b.status === "PENDING" && <button type="button" onClick={() => change.mutate({ id: b._id, status: "CONFIRMED" })} className="btn-primary !px-3 !py-1">Confirm</button>}
                      {b.status === "CONFIRMED" && <button type="button" onClick={() => change.mutate({ id: b._id, status: "COMPLETED" })} className="btn-outline !px-3 !py-1">Complete</button>}
                      {(b.status === "PENDING" || b.status === "CONFIRMED") && <button type="button" onClick={() => window.confirm("Cancel this booking?") && change.mutate({ id: b._id, status: "CANCELLED" })} className="btn-ghost !px-3 !py-1 !text-red-700">Cancel</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
