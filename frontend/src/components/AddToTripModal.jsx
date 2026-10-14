import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { getTrips, addTripItem } from "../services/tripApi";
import { formatDate, toInputDate } from "../lib/format";

// Used on the listing page: choose a trip and a date, then the listing is added to the itinerary
export default function AddToTripModal({ open, onClose, listing }) {
  const [tripId, setTripId] = useState("");
  const [date, setDate] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["trips"], queryFn: getTrips, enabled: open });
  const trips = data?.trips || [];
  const trip = trips.find((t) => t._id === tripId);

  const mutation = useMutation({
    mutationFn: () => addTripItem(tripId, { listing: listing._id, date }),
    onSuccess: () => {
      toast.success("Added to your trip");
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const chooseTrip = (id) => {
    setTripId(id);
    const t = trips.find((x) => x._id === id);
    setDate(t ? toInputDate(t.startDate) : "");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add to a trip">
      {isLoading ? <p className="text-muted">Loading your trips...</p> : trips.length === 0 ? (
        <div>
          <p className="text-muted">You don't have a trip yet. Create one first, then add this place.</p>
          <Link to="/trips" className="btn-primary mt-4">Start your first trip</Link>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div>
            <label htmlFor="trip-select" className="label">Trip</label>
            <select id="trip-select" className="input" value={tripId} onChange={(e) => chooseTrip(e.target.value)} required>
              <option value="">Choose a trip</option>
              {trips.map((t) => <option key={t._id} value={t._id}>{t.name} ({formatDate(t.startDate, "d MMM")})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="trip-date" className="label">Day</label>
            <input id="trip-date" type="date" className="input" value={date} min={trip ? toInputDate(trip.startDate) : undefined} max={trip ? toInputDate(trip.endDate) : undefined} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">{mutation.isPending ? "Adding..." : "Add to trip"}</button>
        </form>
      )}
    </Modal>
  );
}
