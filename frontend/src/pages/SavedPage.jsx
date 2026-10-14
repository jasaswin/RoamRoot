import { useState } from "react";
import Seo from "../components/Seo";
import ListingCard from "../components/ListingCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { ListingGridSkeleton } from "../components/Skeleton";
import useFavorites from "../hooks/useFavorites";
import { typeLabel } from "../lib/format";

export default function SavedPage() {
  const { listings, isLoading, isError, error, refetch } = useFavorites();
  const [type, setType] = useState("");

  const types = [...new Set(listings.map((l) => l.type))];
  const visible = type ? listings.filter((l) => l.type === type) : listings;

  return (
    <div className="container-page py-10">
      <Seo title="Saved places" />
      <p className="eyebrow">Your wishlist</p>
      <h1 className="text-4xl sm:text-5xl">Saved places</h1>

      {types.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter saved places">
          <button type="button" onClick={() => setType("")} className={`chip ${type === "" ? "chip-active" : ""}`}>All ({listings.length})</button>
          {types.map((t) => <button key={t} type="button" onClick={() => setType(t)} className={`chip ${type === t ? "chip-active" : ""}`}>{typeLabel(t)}</button>)}
        </div>
      )}

      <div className="mt-8">
        {isLoading ? <ListingGridSkeleton count={4} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" /> : isError ? <ErrorState message={error.message} onRetry={refetch} /> : listings.length === 0 ? (
          <EmptyState image="/images/empty-states/empty-saved.svg" title="No saved places yet." text="Tap the heart on any stay or experience to keep it here." actionLabel="Start exploring" actionTo="/discover" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{visible.map((l) => <ListingCard key={l._id} listing={l} />)}</div>
        )}
      </div>
    </div>
  );
}
