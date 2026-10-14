import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Seo from "../components/Seo";
import SectionHeading from "../components/SectionHeading";
import ListingCard from "../components/ListingCard";
import DestinationCard from "../components/DestinationCard";
import StoryCard from "../components/StoryCard";
import CreatorCard from "../components/CreatorCard";
import ErrorState from "../components/ErrorState";
import { ListingGridSkeleton, Skeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { getListings, getDestinations } from "../services/listingApi";
import { getStories } from "../services/storyApi";
import { getFeaturedCreators } from "../services/creatorApi";
import { recommend } from "../services/aiApi";
import { MOODS, DESTINATIONS } from "../lib/constants";
import { firstImage } from "../lib/format";

// Loads a list of listings and shows skeleton / error / cards
function ListingRow({ queryKey, params, variant, columns = "sm:grid-cols-2 lg:grid-cols-3" }) {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey, queryFn: () => getListings(params) });
  if (isLoading) return <ListingGridSkeleton count={params.limit} className={`grid gap-6 ${columns}`} />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  return <div className={`grid gap-6 ${columns}`}>{data.items.map((l) => <ListingCard key={l._id} listing={l} variant={variant} />)}</div>;
}

export default function HomePage() {
  const { isAuthenticated, currentUser } = useAuth();
  const destinationsQuery = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });
  const storiesQuery = useQuery({ queryKey: ["stories", "home"], queryFn: () => getStories({ limit: 3 }) });
  const creatorsQuery = useQuery({ queryKey: ["creators", "featured"], queryFn: getFeaturedCreators });
  const gemsQuery = useQuery({ queryKey: ["listings", "gems"], queryFn: () => getListings({ tag: "hidden-gem", limit: 4, sort: "rating" }) });
  const forYouQuery = useQuery({ queryKey: ["recommend", "home", currentUser?._id], queryFn: () => recommend({ limit: 4 }), enabled: isAuthenticated });

  const counts = {};
  (destinationsQuery.data?.destinations || []).forEach((d) => (counts[d.name] = d.count));
  const gems = gemsQuery.data?.items || [];

  return (
    <>
      <Seo title="Discover places worth remembering" />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-forest-deep">
        <img src="/images/hero/hero-main.jpg" alt="Green mountain valley with clouds" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80" fetchpriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-deep/80 via-forest-deep/40 to-transparent" aria-hidden="true" />
        <div className="container-page flex min-h-[78vh] flex-col justify-center py-20">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow !text-terracotta-soft">Discover → Save → Plan → Book → Travel → Share</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-4 max-w-3xl text-5xl !leading-[1.05] !text-cream sm:text-7xl">Discover places worth remembering.</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-5 max-w-xl text-lg text-cream/90">Find unique stays, local experiences, hidden gems and journeys made for you.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className="btn-accent !px-7 !py-3.5 text-base">Explore RoamRoot <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/ai-planner" className="btn-light !px-7 !py-3.5 text-base"><Sparkles className="h-4 w-4" aria-hidden="true" /> Plan with AI</Link>
          </motion.div>
        </div>
      </section>

      {/* Recommended (only when logged in) */}
      {isAuthenticated && forYouQuery.data?.recommendations?.length > 0 && (
        <section className="container-page pt-16">
          <SectionHeading eyebrow="For you" title="Picked for your next trip" text="Based on your interests, saved places and past bookings." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {forYouQuery.data.recommendations.map((r) => (
              <div key={r.listing._id}>
                <ListingCard listing={r.listing} />
                {r.reasons[0] && <p className="mt-1 px-1 text-xs text-sage">{r.reasons[0]}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Moods */}
      <section className="container-page pt-20">
        <SectionHeading eyebrow="Explore by mood" title="Find somewhere that feels different." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MOODS.map((mood, i) => (
            <Link key={mood.name} to={`/discover?tag=${mood.tag}`} className={`group relative overflow-hidden rounded-3xl ${i % 5 === 0 ? "md:row-span-2" : ""}`}>
              <img src={mood.image} alt="" loading="lazy" className={`w-full object-cover transition duration-700 group-hover:scale-105 ${i % 5 === 0 ? "h-full min-h-[300px]" : "aspect-[4/3]"}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-0 p-4 text-cream"><p className="font-serif text-xl font-semibold">{mood.name}</p><p className="text-xs text-cream/80">{mood.text}</p></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending experiences */}
      <section className="container-page pt-24">
        <SectionHeading eyebrow="Trending now" title="Go beyond the usual itinerary." text="Mountain hikes, local cooking, pottery, wellness and water adventures." linkTo="/experiences" linkLabel="All experiences" />
        <ListingRow queryKey={["listings", "trending"]} params={{ type: "EXPERIENCE,ACTIVITY", limit: 6, sort: "popular" }} variant="portrait" />
      </section>

      {/* Hidden gems: one large feature plus three small */}
      <section className="mt-24 bg-forest py-20 text-cream">
        <div className="container-page">
          <SectionHeading light eyebrow="Hidden gems" title="Places most itineraries skip." text="Quiet waterfalls, secret coves and mountain roads, shared by people who live nearby." linkTo="/discover?tag=hidden-gem" />
          {gemsQuery.isLoading ? <Skeleton className="h-96 w-full" /> : gemsQuery.isError ? <ErrorState message={gemsQuery.error.message} onRetry={gemsQuery.refetch} /> : (
            <div className="grid gap-5 lg:grid-cols-5">
              {gems[0] && (
                <Link to={`/listings/${gems[0]._id}`} className="group relative min-h-[420px] overflow-hidden rounded-[2rem] lg:col-span-3">
                  <img src={firstImage(gems[0], 1000)} alt={gems[0].title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-transparent" aria-hidden="true" />
                  <div className="absolute bottom-0 p-6"><p className="eyebrow !text-terracotta-soft">{gems[0].location}</p><h3 className="mt-1 max-w-md text-3xl !text-cream">{gems[0].title}</h3><p className="mt-2 line-clamp-2 max-w-md text-cream/85">{gems[0].description}</p></div>
                </Link>
              )}
              <div className="grid gap-5 lg:col-span-2">
                {gems.slice(1, 4).map((g) => (
                  <Link key={g._id} to={`/listings/${g._id}`} className="group flex gap-4 rounded-3xl bg-white/5 p-3 transition hover:bg-white/10">
                    <img src={firstImage(g, 300)} alt={g.title} loading="lazy" className="h-28 w-28 flex-shrink-0 rounded-2xl object-cover" />
                    <div className="flex min-w-0 flex-col justify-center"><p className="text-xs text-terracotta-soft">{g.location}</p><h3 className="font-serif text-lg font-semibold !text-cream">{g.title}</h3><p className="line-clamp-2 text-sm text-cream/70">{g.highlights?.[0]}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Unique stays */}
      <section className="container-page pt-24">
        <SectionHeading eyebrow="Unique stays" title="Sleep somewhere you'll remember." text="Cabins, treehouses, houseboats and camps." linkTo="/stays" linkLabel="All stays" />
        <ListingRow queryKey={["listings", "stays"]} params={{ type: "STAY", limit: 4, sort: "rating" }} variant="landscape" columns="sm:grid-cols-2 lg:grid-cols-4" />
      </section>

      {/* Destinations */}
      <section className="container-page pt-24">
        <SectionHeading eyebrow="Destinations" title="Where to next?" />
        <div className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-4">
          {DESTINATIONS.map((d, i) => (
            <DestinationCard key={d.name} destination={d} count={counts[d.name]} className={i === 0 || i === 5 ? "md:col-span-2" : ""} />
          ))}
        </div>
      </section>

      {/* Every destination in the database */}
      {(destinationsQuery.data?.destinations || []).length > 0 && (
        <section className="container-page pt-16">
          <SectionHeading eyebrow="All destinations" title="Browse every state and territory" text="Popular places from across India." />
          <div className="flex flex-wrap gap-2">
            {destinationsQuery.data.destinations.map((d) => (
              <Link key={d.name} to={`/discover?destination=${encodeURIComponent(d.name)}`} className="chip">{d.name} <span className="ml-1.5 text-xs text-muted">{d.count}</span></Link>
            ))}
          </div>
        </section>
      )}

      {/* Stories */}
      <section className="container-page pt-24">
        <SectionHeading eyebrow="Travel stories" title="Your next story starts somewhere." linkTo="/stories" linkLabel="Read more stories" />
        {storiesQuery.isLoading ? <Skeleton className="h-72 w-full" /> : storiesQuery.isError ? <ErrorState message={storiesQuery.error.message} onRetry={storiesQuery.refetch} /> : (
          <div className="grid gap-8 md:grid-cols-3">{storiesQuery.data.items.map((s) => <StoryCard key={s._id} story={s} />)}</div>
        )}
      </section>

      {/* AI planner CTA */}
      <section className="container-page pt-24">
        <div className="grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-forest p-8 sm:p-14 md:grid-cols-2">
          <div>
            <p className="eyebrow !text-terracotta-soft">AI Planner</p>
            <h2 className="mt-2 text-4xl !text-cream sm:text-5xl">Not sure where to go?</h2>
            <p className="mt-4 text-lg text-cream/85">Tell RoamRoot what kind of journey you want.</p>
            <Link to="/ai-planner" className="btn-accent mt-6 !px-7 !py-3.5"><Sparkles className="h-4 w-4" aria-hidden="true" /> Build my trip with AI</Link>
          </div>
          <img src="/images/ai/roamroot-ai-planner.svg" alt="AI trip planner illustration" loading="lazy" className="mx-auto w-full max-w-sm rounded-3xl bg-cream p-6" />
        </div>
      </section>

      {/* Creators */}
      <section className="container-page pt-24">
        <SectionHeading eyebrow="Creator spotlight" title="Meet the people behind the places." />
        {creatorsQuery.isLoading ? <Skeleton className="h-56 w-full" /> : creatorsQuery.isError ? <ErrorState message={creatorsQuery.error.message} onRetry={creatorsQuery.refetch} /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{creatorsQuery.data.creators.map((c) => <CreatorCard key={c._id} creator={c} />)}</div>
        )}
        <div className="mt-10 grid items-center gap-8 rounded-[2.5rem] border border-sand bg-white p-8 sm:p-12 md:grid-cols-2">
          <img src="/images/creators/roamroot-creator.svg" alt="Creator illustration" loading="lazy" className="mx-auto w-full max-w-xs" />
          <div>
            <h2 className="text-3xl sm:text-4xl">Know a place worth sharing?</h2>
            <p className="mt-3 text-muted">Turn your local knowledge into someone's next unforgettable journey.</p>
            <Link to="/creator/dashboard" className="btn-primary mt-6">Become a Creator</Link>
          </div>
        </div>
      </section>
    </>
  );
}
