import { useQuery } from "@tanstack/react-query";
import Seo from "../../components/Seo";
import ErrorState from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { BookingsChart, RevenueChart, ListingBarChart } from "../../components/CreatorCharts";
import { getAnalytics } from "../../services/creatorApi";
import { formatPrice } from "../../lib/format";

export default function CreatorAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["creator", "analytics"], queryFn: getAnalytics });
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;

  const { monthly, performance, topExperiences } = data;
  return (
    <div className="space-y-8">
      <Seo title="Analytics" />
      <div className="grid gap-6 lg:grid-cols-2"><BookingsChart data={monthly} /><RevenueChart data={monthly} /></div>
      <div className="grid gap-6 lg:grid-cols-2"><ListingBarChart title="Views per listing" data={performance} dataKey="views" /><ListingBarChart title="Top experiences by bookings" data={topExperiences} dataKey="bookings" color="#C86B4A" /></div>
      <section className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="p-5 text-left font-serif text-xl text-forest">Listing performance</caption>
          <thead className="border-y border-sand text-muted"><tr><th className="p-4">Listing</th><th className="p-4">Views</th><th className="p-4">Bookings</th><th className="p-4">Revenue</th><th className="p-4">Rating</th></tr></thead>
          <tbody>{performance.map((l) => <tr key={l._id} className="border-b border-sand/50 last:border-0"><td className="p-4 font-medium">{l.title}</td><td className="p-4">{l.views}</td><td className="p-4">{l.bookings}</td><td className="p-4">{formatPrice(l.revenue)}</td><td className="p-4">{l.rating || "New"}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
