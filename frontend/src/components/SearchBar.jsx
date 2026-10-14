import { Search, MapPin, Calendar } from "lucide-react";
import { CATEGORIES } from "../lib/constants";
import { toInputDate } from "../lib/format";

// Three simple questions: Where? What kind of experience? When?
export default function SearchBar({ filters, onChange, destinations = [] }) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-3xl border border-sand bg-white p-3 shadow-card md:grid-cols-[1.3fr_1fr_1fr_auto]">
      <label className="flex items-center gap-3 rounded-2xl px-3 py-2 focus-within:bg-cream">
        <MapPin className="h-5 w-5 flex-shrink-0 text-terracotta" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-xs font-semibold text-forest">Where do you want to go?</span>
          <input list="search-destinations" value={filters.q ?? ""} onChange={(e) => onChange({ q: e.target.value })} placeholder="Search places, stays, ideas" className="w-full bg-transparent text-sm focus:outline-none" aria-label="Search" />
          <datalist id="search-destinations">{destinations.map((d) => <option key={d.name} value={d.name} />)}</datalist>
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-2xl px-3 py-2 focus-within:bg-cream">
        <Search className="h-5 w-5 flex-shrink-0 text-terracotta" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-xs font-semibold text-forest">What kind of experience?</span>
          <select value={filters.category?.split(",")[0] || ""} onChange={(e) => onChange({ category: e.target.value })} className="w-full bg-transparent text-sm focus:outline-none">
            <option value="">Anything</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-2xl px-3 py-2 focus-within:bg-cream">
        <Calendar className="h-5 w-5 flex-shrink-0 text-terracotta" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-xs font-semibold text-forest">When?</span>
          <input type="date" min={toInputDate(new Date())} value={filters.date || ""} onChange={(e) => onChange({ date: e.target.value })} className="w-full bg-transparent text-sm focus:outline-none" aria-label="Travel date" />
        </span>
      </label>
      <button type="submit" className="btn-primary hidden md:inline-flex" aria-label="Search">Search</button>
    </form>
  );
}
