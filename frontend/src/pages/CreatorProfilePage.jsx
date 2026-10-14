import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import Seo from "../components/Seo";
import Avatar from "../components/Avatar";
import Rating from "../components/Rating";
import ListingCard from "../components/ListingCard";
import StoryCard from "../components/StoryCard";
import ReviewCard from "../components/ReviewCard";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { getCreatorProfile } from "../services/creatorApi";
import { formatDate } from "../lib/format";

export default function CreatorProfilePage() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["creator", id], queryFn: () => getCreatorProfile(id) });

  if (isLoading) return <div className="container-page py-10"><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <div className="container-page py-20"><ErrorState message={error.message} onRetry={refetch} /></div>;

  const { creator, listings, stories, reviews, rating, reviewCount } = data;
  const stays = listings.filter((l) => l.type === "STAY");
  const experiences = listings.filter((l) => l.type !== "STAY");

  return (
    <div className="container-page py-10">
      <Seo title={creator.name} description={creator.bio} />
      <header className="flex flex-col items-start gap-6 rounded-[2.5rem] bg-white p-8 shadow-card sm:flex-row sm:items-center">
        <Avatar user={creator} size={120} />
        <div>
          <p className="eyebrow">Creator</p>
          <h1 className="text-4xl sm:text-5xl">{creator.name}</h1>
          {creator.location && <p className="mt-2 flex items-center gap-1 text-muted"><MapPin className="h-4 w-4" aria-hidden="true" /> {creator.location}</p>}
          <p className="mt-3 max-w-2xl text-charcoal/80">{creator.bio}</p>
          <p className="mt-3 flex items-center gap-4 text-sm"><Rating value={rating} count={reviewCount} /><span className="text-muted">{listings.length} listings · Joined {formatDate(creator.createdAt, "MMMM yyyy")}</span></p>
        </div>
      </header>

      {experiences.length > 0 && <section className="mt-12"><h2 className="mb-5 text-3xl">Experiences and places</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{experiences.map((l) => <ListingCard key={l._id} listing={l} />)}</div></section>}
      {stays.length > 0 && <section className="mt-12"><h2 className="mb-5 text-3xl">Stays</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{stays.map((l) => <ListingCard key={l._id} listing={l} variant="landscape" />)}</div></section>}
      {stories.length > 0 && <section className="mt-12"><h2 className="mb-5 text-3xl">Stories by {creator.name.split(" ")[0]}</h2><div className="grid gap-8 md:grid-cols-3">{stories.map((s) => <StoryCard key={s._id} story={{ ...s, author: creator }} />)}</div></section>}
      {reviews.length > 0 && <section className="mt-12 max-w-3xl"><h2 className="mb-2 text-3xl">What guests say</h2>{reviews.map((r) => <div key={r._id}><ReviewCard review={r} /><p className="-mt-3 pb-3 text-xs text-muted">on {r.listing?.title}</p></div>)}</section>}
    </div>
  );
}
