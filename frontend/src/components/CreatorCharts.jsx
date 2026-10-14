import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { formatPrice } from "../lib/format";

const COLORS = { forest: "#183A37", terracotta: "#C86B4A", sage: "#6B8F71", grid: "#DCCDB8" };

function ChartCard({ title, children, empty }) {
  return (
    <section className="card p-5">
      <h3 className="mb-4 text-xl">{title}</h3>
      {empty ? <p className="py-10 text-center text-sm text-muted">Nothing to show yet.</p> : <div className="h-64">{children}</div>}
    </section>
  );
}

const axis = { tick: { fontSize: 12, fill: "#6B716D" }, stroke: COLORS.grid };

export function BookingsChart({ data }) {
  return (
    <ChartCard title="Bookings over time" empty={data.every((m) => m.bookings === 0)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}><CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" /><XAxis dataKey="label" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip /><Line type="monotone" dataKey="bookings" name="Bookings" stroke={COLORS.terracotta} strokeWidth={3} dot={{ r: 4 }} /></LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RevenueChart({ data }) {
  return (
    <ChartCard title="Revenue (confirmed and completed)" empty={data.every((m) => m.revenue === 0)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}><CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" /><XAxis dataKey="label" {...axis} /><YAxis tickFormatter={(v) => `₹${v / 1000}k`} {...axis} /><Tooltip formatter={(v) => formatPrice(v)} /><Bar dataKey="revenue" name="Revenue" fill={COLORS.forest} radius={[8, 8, 0, 0]} /></BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Horizontal bars: listing performance by views or bookings
export function ListingBarChart({ title, data, dataKey, color = COLORS.sage }) {
  const rows = data.map((d) => ({ ...d, short: d.title.length > 22 ? d.title.slice(0, 22) + "..." : d.title }));
  return (
    <ChartCard title={title} empty={rows.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 10 }}><CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} {...axis} /><YAxis type="category" dataKey="short" width={130} {...axis} /><Tooltip /><Bar dataKey={dataKey} fill={color} radius={[0, 8, 8, 0]} /></BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StatCard({ label, value, Icon }) {
  return (
    <div className="card p-5">
      <Icon className="h-5 w-5 text-terracotta" aria-hidden="true" />
      <p className="mt-3 text-3xl font-semibold text-forest">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
