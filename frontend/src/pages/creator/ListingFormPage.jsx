import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../../components/Seo";
import ImageUploader from "../../components/ImageUploader";
import MapView from "../../components/MapView";
import ErrorState from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { getListing, createListing, updateListing, geocodePlace } from "../../services/listingApi";
import { CATEGORIES, LISTING_TYPES } from "../../lib/constants";
import { typeLabel } from "../../lib/format";

const schema = z.object({
  title: z.string().min(3, "Title needs at least 3 characters"),
  description: z.string().min(20, "Describe it in at least 20 characters"),
  type: z.enum(LISTING_TYPES),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  location: z.string().min(2, "Enter the place, e.g. Palolem, Goa"),
  destination: z.string().min(2, "Enter the destination, e.g. Goa"),
  country: z.string().min(2),
  // kept as text so an empty box is an error (a number box would turn "" into 0)
  latitude: z.string().min(1, "Enter a latitude").refine((v) => Math.abs(Number(v)) <= 90, "Latitude is between -90 and 90"),
  longitude: z.string().min(1, "Enter a longitude").refine((v) => Math.abs(Number(v)) <= 180, "Longitude is between -180 and 180"),
  capacity: z.coerce.number().int().min(1, "At least 1 guest"),
  durationHours: z.coerce.number().min(0),
  tags: z.string().optional(),
  amenities: z.string().optional(),
  highlights: z.string().optional(),
  isAvailable: z.boolean(),
});

const toList = (text, separator = ",") => (text || "").split(separator).map((t) => t.trim()).filter(Boolean);
const empty = { title: "", description: "", type: "EXPERIENCE", category: "Adventure", price: 0, location: "", destination: "", country: "India", latitude: "", longitude: "", capacity: 4, durationHours: 3, tags: "", amenities: "", highlights: "", isAvailable: true };

export default function ListingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [finding, setFinding] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: empty });
  const existing = useQuery({ queryKey: ["listing", id], queryFn: () => getListing(id), enabled: isEdit });

  // fill the form when editing
  useEffect(() => {
    if (!existing.data) return;
    const l = existing.data.listing;
    reset({
      title: l.title, description: l.description, type: l.type, category: l.category, price: l.price, location: l.location, destination: l.destination, country: l.country,
      latitude: String(l.coordinates.lat), longitude: String(l.coordinates.lng), capacity: l.capacity, durationHours: l.durationHours,
      tags: l.tags.join(", "), amenities: l.amenities.join(", "), highlights: l.highlights.join("\n"), isAvailable: l.availability?.isAvailable !== false,
    });
    setImages(l.images);
  }, [existing.data, reset]);

  const save = useMutation({
    mutationFn: (body) => (isEdit ? updateListing(id, body) : createListing(body)),
    onSuccess: (data) => {
      toast.success(isEdit ? "Listing updated" : "Listing created");
      queryClient.invalidateQueries({ queryKey: ["creator"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", data.listing._id] });
      navigate("/creator/listings");
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (v) => {
    if (images.length === 0) return toast.error("Please add at least one photo");
    save.mutate({
      title: v.title, description: v.description, type: v.type, category: v.category, price: v.price, location: v.location, destination: v.destination, country: v.country,
      coordinates: { lat: Number(v.latitude), lng: Number(v.longitude) }, images, capacity: v.capacity, durationHours: v.type === "STAY" ? 0 : v.durationHours,
      tags: toList(v.tags).map((t) => t.toLowerCase()), amenities: toList(v.amenities), highlights: toList(v.highlights, "\n"),
      availability: { isAvailable: v.isAvailable },
    });
  };

  const findOnMap = async () => {
    const text = [watch("location"), watch("country")].filter(Boolean).join(", ");
    try {
      setFinding(true);
      const spot = await geocodePlace(text);
      setValue("latitude", String(spot.lat), { shouldValidate: true });
      setValue("longitude", String(spot.lng), { shouldValidate: true });
      toast.success("Coordinates filled in");
    } catch (err) { toast.error(err.message); } finally { setFinding(false); }
  };

  if (isEdit && existing.isLoading) return <Skeleton className="h-96 w-full" />;
  if (isEdit && existing.isError) return <ErrorState message={existing.error.message} onRetry={existing.refetch} />;

  const lat = Number(watch("latitude"));
  const lng = Number(watch("longitude"));
  const preview = Number.isFinite(lat) && Number.isFinite(lng) && watch("latitude") !== "" && watch("longitude") !== "" ? [{ _id: "preview", title: watch("title") || "Your listing", coordinates: { lat, lng } }] : [];
  const isStay = watch("type") === "STAY";

  const Field = ({ name, label, hint, children }) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      {children}
      {hint && !errors[name] && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {errors[name] && <p role="alert" className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
    </div>
  );
  const cls = (name) => `input ${errors[name] ? "input-error" : ""}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6" noValidate>
      <Seo title={isEdit ? "Edit listing" : "New listing"} />
      <h2 className="text-3xl">{isEdit ? "Edit listing" : "Create a listing"}</h2>

      <section className="card space-y-4 p-6">
        <h3 className="text-xl">The basics</h3>
        <Field name="title" label="Title"><input id="title" className={cls("title")} aria-invalid={Boolean(errors.title)} {...register("title")} /></Field>
        <Field name="description" label="Description"><textarea id="description" rows={5} className={cls("description")} aria-invalid={Boolean(errors.description)} {...register("description")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="type" label="Type"><select id="type" className="input" {...register("type")}>{LISTING_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}</select></Field>
          <Field name="category" label="Category"><select id="category" className="input" {...register("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="text-xl">Price and capacity</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="price" label={isStay ? "Price per night (₹)" : "Price per person (₹)"}><input id="price" type="number" min={0} className={cls("price")} {...register("price")} /></Field>
          <Field name="capacity" label="Max guests"><input id="capacity" type="number" min={1} className={cls("capacity")} {...register("capacity")} /></Field>
          {!isStay && <Field name="durationHours" label="Duration (hours)"><input id="durationHours" type="number" min={0} step="0.5" className={cls("durationHours")} {...register("durationHours")} /></Field>}
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#183A37]" {...register("isAvailable")} /> Available for booking</label>
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="text-xl">Location</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="location" label="Place" hint="Shown on the listing"><input id="location" placeholder="Palolem, South Goa" className={cls("location")} {...register("location")} /></Field>
          <Field name="destination" label="Destination" hint="Used by search and the AI planner"><input id="destination" placeholder="Goa" className={cls("destination")} {...register("destination")} /></Field>
        </div>
        <Field name="country" label="Country"><input id="country" className={cls("country")} {...register("country")} /></Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field name="latitude" label="Latitude"><input id="latitude" type="number" step="any" className={cls("latitude")} {...register("latitude")} /></Field>
          <Field name="longitude" label="Longitude"><input id="longitude" type="number" step="any" className={cls("longitude")} {...register("longitude")} /></Field>
          <button type="button" onClick={findOnMap} disabled={finding} className="btn-outline"><MapPin className="h-4 w-4" aria-hidden="true" /> {finding ? "Searching..." : "Find on map"}</button>
        </div>
        <MapView listings={preview} className="h-56" />
      </section>

      <section className="card space-y-4 p-6">
        <h3 className="text-xl">Details</h3>
        <Field name="tags" label="Tags" hint="Comma separated, e.g. hiking, adventure, weekend, hidden-gem"><input id="tags" className="input" {...register("tags")} /></Field>
        <Field name="amenities" label="What's included" hint="Comma separated, e.g. Breakfast, Guide, Wi-Fi"><input id="amenities" className="input" {...register("amenities")} /></Field>
        <Field name="highlights" label="Highlights" hint="One per line"><textarea id="highlights" rows={3} className="input" {...register("highlights")} /></Field>
      </section>

      <section className="card p-6"><h3 className="mb-4 text-xl">Photos</h3><ImageUploader images={images} onChange={setImages} max={8} /></section>

      <div className="flex gap-3">
        <button type="submit" disabled={save.isPending} className="btn-accent !px-8 !py-3">{save.isPending ? "Saving..." : isEdit ? "Save changes" : "Publish listing"}</button>
        <button type="button" onClick={() => navigate("/creator/listings")} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
