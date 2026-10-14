import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import TripCard from "../components/TripCard";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { getTrips, createTrip, deleteTrip } from "../services/tripApi";

const schema = z.object({
  name: z.string().min(2, "Give your trip a name"),
  destination: z.string().min(2, "Where are you going?"),
  startDate: z.string().min(1, "Choose a start date"),
  endDate: z.string().min(1, "Choose an end date"),
  budget: z.coerce.number().min(0).optional(),
  description: z.string().max(500).optional(),
}).refine((v) => v.endDate >= v.startDate, { message: "End date must be after the start date", path: ["endDate"] });

export function TripForm({ onSubmit, loading, defaults = {}, submitLabel = "Create trip" }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });
  const field = (name, label, props = {}) => (
    <div>
      <label htmlFor={`trip-${name}`} className="label">{label}</label>
      <input id={`trip-${name}`} className={`input ${errors[name] ? "input-error" : ""}`} aria-invalid={Boolean(errors[name])} {...props} {...register(name)} />
      {errors[name] && <p role="alert" className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
    </div>
  );
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {field("name", "Trip name", { placeholder: "Slow week in Kerala" })}
      {field("destination", "Destination", { placeholder: "Kerala" })}
      <div className="grid grid-cols-2 gap-3">{field("startDate", "Start", { type: "date" })}{field("endDate", "End", { type: "date" })}</div>
      {field("budget", "Budget in ₹ (optional)", { type: "number", min: 0 })}
      <div>
        <label htmlFor="trip-description" className="label">Description (optional)</label>
        <textarea id="trip-description" rows={2} className="input" {...register("description")} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Saving..." : submitLabel}</button>
    </form>
  );
}

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["trips"], queryFn: getTrips });

  const create = useMutation({
    mutationFn: createTrip,
    onSuccess: (res) => {
      toast.success("Trip created");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setOpen(false);
      navigate(`/trips/${res.trip._id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (trip) => deleteTrip(trip._id),
    onSuccess: () => { toast.success("Trip deleted"); queryClient.invalidateQueries({ queryKey: ["trips"] }); },
    onError: (err) => toast.error(err.message),
  });

  const trips = data?.trips || [];
  const confirmDelete = (trip) => { if (window.confirm(`Delete "${trip.name}"? This cannot be undone.`)) remove.mutate(trip); };

  return (
    <div className="container-page py-10">
      <Seo title="Your trips" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Travel journal</p><h1 className="text-4xl sm:text-5xl">Your trips</h1></div>
        <button type="button" onClick={() => setOpen(true)} className="btn-accent"><Plus className="h-4 w-4" aria-hidden="true" /> New trip</button>
      </div>

      <div className="mt-8">
        {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-64" />)}</div> : isError ? <ErrorState message={error.message} onRetry={refetch} /> : trips.length === 0 ? (
          <EmptyState image="/images/empty-states/empty-trips.svg" title="Start your first trip." text="Plan days, add experiences and keep everything in one place." actionLabel="Create a trip" onAction={() => setOpen(true)} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{trips.map((t) => <TripCard key={t._id} trip={t} onDelete={confirmDelete} />)}</div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New trip">
        <TripForm onSubmit={(values) => create.mutate(values)} loading={create.isPending} />
      </Modal>
    </div>
  );
}
