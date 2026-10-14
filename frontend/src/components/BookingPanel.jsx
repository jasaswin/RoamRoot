import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { createBooking } from "../services/bookingApi";
import { formatPrice, priceUnit, toInputDate } from "../lib/format";

const today = toInputDate(new Date());

export default function BookingPanel({ listing, defaultDate = "" }) {
  const isStay = listing.type === "STAY";
  const [checkIn, setCheckIn] = useState(defaultDate >= today ? defaultDate : "");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const nights = isStay && checkIn && checkOut ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn)) : 0;
  const total = isStay ? nights * listing.price : guests * listing.price;
  const isOwner = currentUser?._id === listing.creator?._id;
  const ready = checkIn && (!isStay || nights > 0);

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      toast.success(`Booked! Your reference is ${data.booking.bookingReference}`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/bookings");
    },
    onError: (err) => toast.error(err.message),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast("Log in to book");
      return navigate("/login", { state: { from: location.pathname } });
    }
    mutation.mutate({ listing: listing._id, checkIn, checkOut: isStay ? checkOut : null, guests });
  };

  if (!listing.availability?.isAvailable) {
    return <aside className="card p-6"><p className="font-semibold text-forest">Not available right now</p></aside>;
  }

  return (
    <aside className="card sticky top-24 p-6" aria-label="Booking">
      <p className="text-3xl font-semibold text-forest">
        {formatPrice(listing.price)}
        {listing.price > 0 && <span className="text-base font-normal text-muted"> / {priceUnit(listing.type)}</span>}
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className={isStay ? "grid grid-cols-2 gap-3" : ""}>
          <div>
            <label htmlFor="checkin" className="label">{isStay ? "Check-in" : "Date"}</label>
            <input id="checkin" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input" required />
          </div>
          {isStay && (
            <div>
              <label htmlFor="checkout" className="label">Check-out</label>
              <input id="checkout" type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input" required />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="guests" className="label">Guests (max {listing.capacity})</label>
          <input id="guests" type="number" min={1} max={listing.capacity} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} className="input" />
        </div>

        {ready && (
          <dl className="space-y-1 rounded-2xl bg-cream p-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">{isStay ? `${formatPrice(listing.price)} x ${nights} night${nights > 1 ? "s" : ""}` : `${formatPrice(listing.price)} x ${guests} guest${guests > 1 ? "s" : ""}`}</dt><dd>{formatPrice(total)}</dd></div>
            <div className="flex justify-between border-t border-sand pt-2 text-base font-semibold text-forest"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
        )}

        <button type="submit" disabled={mutation.isPending || isOwner} className="btn-accent w-full !py-3">
          {isOwner ? "This is your listing" : mutation.isPending ? "Booking..." : "Confirm booking"}
        </button>
      </form>
      <p className="mt-4 text-xs text-muted">
        Cancellation: you can cancel from your bookings page. This is a demo booking, so no payment is taken.
      </p>
    </aside>
  );
}
