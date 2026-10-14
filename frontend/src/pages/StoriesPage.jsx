import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import Seo from "../components/Seo";
import StoryCard from "../components/StoryCard";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { getStories } from "../services/storyApi";

export default function StoriesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["stories", page], queryFn: () => getStories({ page, limit: 7 }), placeholderData: keepPreviousData });
  const items = data?.items || [];
  const [first, ...rest] = items;

  return (
    <div className="container-page py-10">
      <Seo title="Travel stories" description="Read travel stories from the RoamRoot community." />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">The RoamRoot journal</p><h1 className="text-4xl sm:text-6xl">Travel stories</h1></div>
        <Link to="/create-story" className="btn-accent"><PenLine className="h-4 w-4" aria-hidden="true" /> Share your story</Link>
      </div>

      <div className="mt-10">
        {isLoading ? <Skeleton className="h-96 w-full" /> : isError ? <ErrorState message={error.message} onRetry={refetch} /> : items.length === 0 ? (
          <EmptyState title="No stories yet." text="Be the first to share a journey." actionLabel="Write a story" actionTo="/create-story" />
        ) : (
          <>
            {page === 1 && first && <div className="mb-12 grid items-center gap-8 lg:grid-cols-5"><div className="lg:col-span-3"><StoryCard story={first} large /></div><div className="lg:col-span-2"><p className="text-lg leading-relaxed text-charcoal/80">{first.content.slice(0, 260)}...</p><Link to={`/stories/${first._id}`} className="mt-3 inline-block font-semibold text-terracotta">Keep reading →</Link></div></div>}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{(page === 1 ? rest : items).map((s) => <StoryCard key={s._id} story={s} />)}</div>
            {data.pagination.pages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline">Previous</button>
                <span className="text-sm text-muted">Page {data.pagination.page} of {data.pagination.pages}</span>
                <button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)} className="btn-outline">Next</button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
