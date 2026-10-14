import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SlidersHorizontal, Map as MapIcon, List, ChevronLeft, ChevronRight } from "lucide-react";
import Seo from "../components/Seo";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import ListingCard from "../components/ListingCard";
import MapView from "../components/MapView";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { ListingGridSkeleton } from "../components/Skeleton";
import useDebounce from "../hooks/useDebounce";
import { getListings, getDestinations } from "../services/listingApi";
import { PRESETS } from "../lib/constants";

const FILTER_KEYS = ["q", "destination", "type", "category", "tag", "maxPrice", "minRating", "maxDuration", "sort", "date", "page"];

export default function DiscoverPage({ preset }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false); // mobile only
  const [activeId, setActiveId] = useState(null);
  const presetInfo = preset ? PRESETS[preset] : null;

  // All filters live in the URL, so a search can be shared
  const filters = {};
  FILTER_KEYS.forEach((key) => { if (searchParams.get(key)) filters[key] = searchParams.get(key); });

  const updateFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!("page" in patch)) next.delete("page"); // a new filter starts from page 1
    setSearchParams(next, { replace: true });
  };

  const debouncedQ = useDebounce(filters.q, 400);
  const queryParams = { ...filters, q: debouncedQ, limit: 12 };
  if (presetInfo) queryParams.type = presetInfo.types.join(",");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["listings", queryParams],
    queryFn: () => getListings(queryParams),
    placeholderData: keepPreviousData,
  });
  const destinationsQuery = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });
  const destinations = destinationsQuery.data?.destinations || [];

  const items = data?.items || [];
  const pagination = data?.pagination;
  const page = Number(filters.page || 1);
  const clearFilters = () => setSearchParams({}, { replace: true });
  const hasFilters = Object.keys(filters).some((k) => k !== "sort" && k !== "page");
  const dateSearch = filters.date ? `?date=${filters.date}` : "";

  const panel = <FilterPanel filters={filters} onChange={updateFilters} onClear={clearFilters} hideTypes={Boolean(presetInfo)} destinations={destinations} />;

  return (
    <>
      <Seo title={presetInfo ? presetInfo.title : "Discover"} description={presetInfo ? presetInfo.text : "Search stays, experiences, places and hidden gems across India."} />

      {presetInfo && (
        <section className="relative isolate overflow-hidden bg-forest-deep">
          <img src={presetInfo.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
          <div className="container-page py-16 sm:py-24"><p className="eyebrow !text-terracotta-soft">{presetInfo.eyebrow}</p><h1 className="mt-2 text-5xl !text-cream sm:text-6xl">{presetInfo.title}</h1><p className="mt-3 max-w-xl text-lg text-cream/90">{presetInfo.text}</p></div>
        </section>
      )}

      <div className="container-page py-8">
        {!presetInfo && <h1 className="mb-6 text-4xl sm:text-5xl">Discover</h1>}
        <SearchBar filters={filters} onChange={updateFilters} destinations={destinations} />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">{pagination ? `${pagination.total} result${pagination.total === 1 ? "" : "s"}` : "Searching..."}{isFetching && !isLoading ? " · updating" : ""}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setFiltersOpen(true)} className="btn-outline lg:hidden"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters</button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={filters.sort || "popular"} onChange={(e) => updateFilters({ sort: e.target.value })} className="input !w-auto">
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
              <option value="priceLow">Price: low to high</option>
              <option value="priceHigh">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_420px]">
          <aside className="hidden lg:block" aria-label="Filters">{panel}</aside>

          <section aria-label="Results" className={showMap ? "hidden xl:block" : ""}>
            {isLoading ? <ListingGridSkeleton count={6} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3" /> : isError ? <ErrorState message={error.message} onRetry={refetch} /> : items.length === 0 ? (
              <EmptyState image="/images/empty-states/empty-search.svg" title="We couldn't find that adventure." text="Try a different destination or remove a few filters." actionLabel={hasFilters ? "Clear filters" : undefined} onAction={clearFilters} />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {items.map((l) => <ListingCard key={l._id} listing={l} active={l._id === activeId} onHover={setActiveId} search={dateSearch} variant={l.type === "STAY" ? "landscape" : "portrait"} />)}
                </div>
                {pagination.pages > 1 && (
                  <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
                    <button type="button" disabled={page <= 1} onClick={() => updateFilters({ page: String(page - 1) })} className="btn-outline"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</button>
                    <span className="text-sm text-muted">Page {pagination.page} of {pagination.pages}</span>
                    <button type="button" disabled={page >= pagination.pages} onClick={() => updateFilters({ page: String(page + 1) })} className="btn-outline">Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
                  </nav>
                )}
              </>
            )}
          </section>

          {/* Map: always visible on wide screens, toggled on phones and tablets */}
          <div className={`${showMap ? "block" : "hidden"} xl:block`}>
            <div className="sticky top-24">
              <MapView listings={items} activeId={activeId} onSelect={setActiveId} className="h-[70vh] xl:h-[calc(100vh-8rem)]" scrollZoom />
            </div>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => setShowMap(!showMap)} className="btn-primary fixed bottom-24 left-1/2 z-[800] -translate-x-1/2 shadow-lift md:bottom-8 xl:hidden">
        {showMap ? <><List className="h-4 w-4" aria-hidden="true" /> Show list</> : <><MapIcon className="h-4 w-4" aria-hidden="true" /> Show map</>}
      </button>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {panel}
        <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary mt-6 w-full">Show {pagination?.total ?? ""} results</button>
      </Modal>
    </>
  );
}
