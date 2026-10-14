import { CATEGORIES, LISTING_TYPES } from "../lib/constants";
import { typeLabel } from "../lib/format";

const PRICE_OPTIONS = [["", "Any price"], ["1000", "Up to ₹1,000"], ["3000", "Up to ₹3,000"], ["5000", "Up to ₹5,000"], ["10000", "Up to ₹10,000"]];
const RATING_OPTIONS = [["", "Any rating"], ["4", "4.0 and up"], ["4.5", "4.5 and up"]];
const DURATION_OPTIONS = [["", "Any duration"], ["3", "Up to 3 hours"], ["8", "Up to a day"], ["72", "Up to 3 days"]];

function toggleInList(csv, value) {
  const list = csv ? csv.split(",") : [];
  const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  return next.join(",");
}

// filters = the URL query values. onChange({ key: value }) updates the URL.
export default function FilterPanel({ filters, onChange, onClear, hideTypes = false, destinations = [] }) {
  const selectedTypes = filters.type ? filters.type.split(",") : [];
  const selectedCategories = filters.category ? filters.category.split(",") : [];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="f-destination" className="label">Destination</label>
        <input id="f-destination" list="destination-options" className="input" placeholder="Goa, Kerala..." value={filters.destination || ""} onChange={(e) => onChange({ destination: e.target.value })} />
        <datalist id="destination-options">{destinations.map((d) => <option key={d.name} value={d.name} />)}</datalist>
      </div>

      {!hideTypes && (
        <fieldset>
          <legend className="label">Type</legend>
          <div className="flex flex-wrap gap-2">
            {LISTING_TYPES.map((t) => (
              <button key={t} type="button" aria-pressed={selectedTypes.includes(t)} onClick={() => onChange({ type: toggleInList(filters.type, t) })} className={`chip ${selectedTypes.includes(t) ? "chip-active" : ""}`}>{typeLabel(t)}</button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="label">Category</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={selectedCategories.includes(c)} onClick={() => onChange({ category: toggleInList(filters.category, c) })} className={`chip ${selectedCategories.includes(c) ? "chip-active" : ""}`}>{c}</button>
          ))}
        </div>
      </fieldset>

      {[["maxPrice", "Price", PRICE_OPTIONS], ["minRating", "Rating", RATING_OPTIONS], ["maxDuration", "Duration", DURATION_OPTIONS]].map(([key, label, options]) => (
        <div key={key}>
          <label htmlFor={`f-${key}`} className="label">{label}</label>
          <select id={`f-${key}`} className="input" value={filters[key] || ""} onChange={(e) => onChange({ [key]: e.target.value })}>
            {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
          </select>
        </div>
      ))}

      {filters.tag && (
        <div>
          <p className="label">Mood / interest</p>
          <button type="button" className="chip chip-active" onClick={() => onChange({ tag: "" })}>{filters.tag} ✕</button>
        </div>
      )}

      <button type="button" onClick={onClear} className="btn-outline w-full">Clear all filters</button>
    </div>
  );
}
