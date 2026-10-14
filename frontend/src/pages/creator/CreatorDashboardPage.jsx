import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutList, CalendarCheck, IndianRupee, Star, Eye } from "lucide-react";
import Seo from "../../components/Seo";
import ErrorState from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { BookingsChart, RevenueChart, ListingBarChart, StatCard } from "../../components/CreatorCharts";
import { getDashboard } from "../../services/creatorApi";
import { formatPrice, formatDate } from "../../lib/format";
import { STATUS_STYLES } from "../BookingsPage";

export default function CreatorDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["creator", "dashboard"], queryFn: getDashboard });

  if (isLoading) return <div className="grid gap-4 sm:grid-cols-5">{[1, 2, 3, 4, 5].map((n) => <Skeleton key={n} className="h-28" />)}</div>;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const { totals, monthly, performance, topExperiences, recentBookings } = data;
  return (
    <div className="space-y-8">
      <Seo title="Creator dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Listings" value={totals.listings} Icon={LayoutList} />
        <StatCard label="Bookings" value={totals.bookings} Icon={CalendarCheck} />
        <StatCard label="Revenue" value={formatPrice(totals.revenue)} Icon={IndianRupee} />
        <StatCard label="Average rating" value={totals.averageRating || "New"} Icon={Star} />
        <StatCard label="Views" value={totals.views.toLocaleString("en-IN")} Icon={Eye} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2"><BookingsChart data={monthly} /><RevenueChart data={monthly} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ListingBarChart title="Listing views" data={performance} dataKey="views" />
        <section className="card p-5">
          <h3 className="mb-4 text-xl">Top experiences</h3>
          {topExperiences.length === 0 ? <p className="text-sm text-muted">No bookings yet.</p> : (
            <ol className="space-y-3">{topExperiences.map((l, i) => <li key={l._id} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light text-sm font-bold text-forest">{i + 1}</span><Link to={`/listings/${l._id}`} className="flex-1 truncate font-medium hover:underline">{l.title}</Link><span className="text-sm text-muted">{l.bookings} bookings</span></li>)}</ol>
          )}
        </section>
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-xl">Recent bookings</h3><Link to="/creator/bookings" className="text-sm font-semibold text-terracotta">Manage all</Link></div>
        {recentBookings.length === 0 ? <p className="text-sm text-muted">No bookings yet.</p> : (
          <ul className="divide-y divide-sand/60">{recentBookings.map((b) => <li key={b._id} className="flex flex-wrap items-center gap-3 py-3 text-sm"><span className="flex-1 font-medium">{b.listing?.title} <span className="font-normal text-muted">by {b.user?.name}</span></span><span className="text-muted">{formatDate(b.checkIn)}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>{b.status}</span><span className="font-semibold">{formatPrice(b.totalPrice)}</span></li>)}</ul>
        )}
      </section>
    </div>
  );
}
