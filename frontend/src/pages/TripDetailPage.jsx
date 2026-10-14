import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, Wallet, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import TripTimeline from "../components/TripTimeline";
import MapView from "../components/MapView";
import Modal from "../components/Modal";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { TripForm } from "./TripsPage";
import useFavorites from "../hooks/useFavorites";
import useDebounce from "../hooks/useDebounce";
import { getTrip, updateTrip, deleteTrip, addTripItem, updateTripItem, deleteTripItem } from "../services/tripApi";
import { getListings } from "../services/listingApi";
import { formatDate, formatPrice, toInputDate, imageUrl, daysBetween, firstImage } from "../lib/format";

// Modal to add an activity: search RoamRoot, pick from saved places, or write a note
function AddActivityModal({ open, onClose, tripId, dayKey, destination }) {
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const debounced = useDebounce(search, 300);
  const queryClient = useQueryClient();
  const { listings: saved } = useFavorites();

  const results = useQuery({ queryKey: ["trip-search", debounced, destination], queryFn: () => getListings({ q: debounced || undefined, destination: debounced ? undefined : destination, limit: 6 }), enabled: open });

  const add = useMutation({
    mutationFn: (body) => addTripItem(tripId, { date: dayKey, ...body }),
    onSuccess: () => { toast.success("Added"); queryClient.invalidateQueries({ queryKey: ["trip", tripId] }); setNote(""); onClose(); },
    onError: (err) => toast.error(err.message),
  });

  const Row = ({ l }) => (
    <li><button type="button" onClick={() => add.mutate({ listing: l._id })} disabled={add.isPending} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-white">
      <img src={firstImage(l, 120)} alt="" className="h-12 w-12 rounded-xl object-cover" /><span className="min-w-0"><span className="block truncate font-semibold text-forest">{l.title}</span><span className="text-xs text-muted">{l.location} · {formatPrice(l.price)}</span></span>
    </button></li>
  );

  return (
    <Modal open={open} onClose={onClose} title="Add an activity">
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" /><label htmlFor="activity-search" className="sr-only">Search RoamRoot</label><input id="activity-search" className="input !pl-9" placeholder={`Search RoamRoot (showing ${destination} first)`} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">{(results.data?.items || []).map((l) => <Row key={l._id} l={l} />)}</ul>
      {saved.length > 0 && !debounced && (<><h3 className="mb-1 mt-4 font-sans text-sm font-semibold text-forest">From your saved places</h3><ul className="max-h-40 space-y-1 overflow-y-auto">{saved.slice(0, 6).map((l) => <Row key={l._id} l={l} />)}</ul></>)}
      <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) add.mutate({ title: note.trim() }); }} className="mt-5 flex gap-2 border-t border-sand pt-4">
        <label htmlFor="activity-note" className="sr-only">Or add a note</label>
        <input id="activity-note" className="input" placeholder="Or write your own: Lunch at the market" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" disabled={!note.trim() || add.isPending} className="btn-primary">Add</button>
      </form>
    </Modal>
  );
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [addDay, setAddDay] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["trip", id], queryFn: () => getTrip(id) });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["trip", id] });
  const onError = (err) => toast.error(err.message);

  const edit = useMutation({ mutationFn: (v) => updateTrip(id, v), onSuccess: () => { toast.success("Trip updated"); setEditOpen(false); refresh(); queryClient.invalidateQueries({ queryKey: ["trips"] }); }, onError });
  const remove = useMutation({ mutationFn: () => deleteTrip(id), onSuccess: () => { toast.success("Trip deleted"); queryClient.invalidateQueries({ queryKey: ["trips"] }); navigate("/trips"); }, onError });
  const saveItem = useMutation({ mutationFn: ({ item, patch }) => updateTripItem(id, item._id, patch), onSuccess: refresh, onError });
  const removeItem = useMutation({ mutationFn: (item) => deleteTripItem(id, item._id), onSuccess: () => { toast.success("Removed"); refresh(); }, onError });

  if (isLoading) return <div className="container-page py-10"><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <div className="container-page py-20"><ErrorState message={error.message} onRetry={refetch} /></div>;

  const { trip, items } = data;
  const dayCount = daysBetween(trip.startDate, trip.endDate);
  // Dates are stored as midnight UTC, so the day keys are built from the ISO string (no time zone surprises)
  const startKey = new Date(trip.startDate).toISOString().slice(0, 10);
  const days = Array.from({ length: dayCount }, (_, i) => {
    const key = new Date(new Date(startKey + "T00:00:00Z").getTime() + i * 86400000).toISOString().slice(0, 10);
    return { key, date: new Date(key + "T12:00:00") };
  });
  // items whose date is outside the trip range are shown on the first day so nothing disappears
  const validKeys = days.map((d) => d.key);
  const shownItems = items.map((i) => (validKeys.includes(i.date.slice(0, 10)) ? i : { ...i, date: days[0].key }));

  const estimated = items.reduce((sum, i) => sum + (i.listing?.price || 0), 0);
  const mapListings = items.filter((i) => i.listing).map((i) => i.listing);

  // Moving an item up or down: rewrite the order numbers of that day
  const moveItem = async (dayItems, index, step) => {
    const list = [...dayItems];
    const target = index + step;
    [list[index], list[target]] = [list[target], list[index]];
    try {
      await Promise.all(list.map((item, order) => (item.order !== order ? updateTripItem(id, item._id, { order }) : null)));
      refresh();
    } catch (err) { toast.error(err.message); }
  };

  const defaults = { name: trip.name, destination: trip.destination, startDate: toInputDate(trip.startDate), endDate: toInputDate(trip.endDate), budget: trip.budget, description: trip.description };

  return (
    <>
      <Seo title={trip.name} />
      <section className="relative isolate overflow-hidden bg-forest-deep">
        {trip.coverImage && <img src={imageUrl(trip.coverImage, 1400)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />}
        <div className="container-page py-14 sm:py-20">
          <Link to="/trips" className="text-sm text-cream/80 hover:text-cream">← All trips</Link>
          <h1 className="mt-3 text-4xl !text-cream sm:text-6xl">{trip.name}</h1>
          {trip.description && <p className="mt-3 max-w-xl text-cream/85">{trip.description}</p>}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-cream">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" /> {trip.destination}</span>
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden="true" /> {formatDate(trip.startDate, "d MMM")} to {formatDate(trip.endDate, "d MMM yyyy")}</span>
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setEditOpen(true)} className="btn-light !py-2"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</button>
            <button type="button" onClick={() => window.confirm("Delete this trip?") && remove.mutate()} className="btn-light !py-2 !text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</button>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_400px]">
        <TripTimeline days={days} items={shownItems} onAdd={setAddDay} onMove={moveItem} onDelete={(item) => removeItem.mutate(item)} onSave={(item, patch) => saveItem.mutate({ item, patch })} />
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-xl"><Wallet className="h-5 w-5 text-terracotta" aria-hidden="true" /> Trip summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Days</dt><dd>{dayCount}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Planned items</dt><dd>{items.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Budget</dt><dd>{trip.budget ? formatPrice(trip.budget) : "Not set"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Listed prices (per person)</dt><dd>{formatPrice(estimated)}</dd></div>
            </dl>
            {trip.budget > 0 && <p className={`mt-3 text-sm font-medium ${estimated <= trip.budget ? "text-sage" : "text-terracotta"}`}>{estimated <= trip.budget ? `${formatPrice(trip.budget - estimated)} left of your budget` : `${formatPrice(estimated - trip.budget)} over budget`}</p>}
          </div>
          <MapView listings={mapListings} route className="h-80" />
        </aside>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit trip"><TripForm defaults={defaults} onSubmit={(v) => edit.mutate(v)} loading={edit.isPending} submitLabel="Save changes" /></Modal>
      <AddActivityModal open={Boolean(addDay)} onClose={() => setAddDay(null)} tripId={id} dayKey={addDay} destination={trip.destination} />
    </>
  );
}
