import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Info, Home } from "lucide-react";
import MapView from "./MapView";
import ListingCard from "./ListingCard";
import { imageUrl, formatPrice } from "../lib/format";
import { toInputDate } from "../lib/format";

function PlanItem({ item }) {
  const real = item.source === "roamroot";
  return (
    <li className="flex gap-3 rounded-2xl border border-sand/70 bg-white p-3">
      {real && item.image ? <img src={imageUrl(item.image, 200)} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" loading="lazy" /> : <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-sage-light text-forest"><Sparkles className="h-6 w-6" aria-hidden="true" /></span>}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-terracotta">{item.time} · {real ? "RoamRoot listing" : "Suggestion"}</p>
        {real ? <Link to={`/listings/${item.listingId}`} className="block truncate font-serif text-lg font-semibold text-forest hover:underline">{item.title}</Link> : <p className="font-serif text-lg font-semibold text-forest">{item.title}</p>}
        <p className="text-sm text-muted">{real ? `${item.location} · ${formatPrice(item.price)}` : item.note}</p>
        {real && item.note && <p className="text-xs text-sage">{item.note}</p>}
      </div>
    </li>
  );
}

export default function AIPlannerResult({ plan, onSave, saving, onReset }) {
  const [startDate, setStartDate] = useState(toInputDate(new Date(Date.now() + 14 * 86400000)));

  if (!plan.supported) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="card p-6 text-center">
          <h2 className="text-2xl">We don't cover that place yet</h2>
          <p className="mt-2 text-muted">{plan.message}</p>
          <button type="button" onClick={onReset} className="btn-outline mt-4">Try another destination</button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{plan.suggestions.map((l) => <ListingCard key={l._id} listing={l} />)}</div>
      </div>
    );
  }

  const mapListings = [plan.stay, ...plan.itinerary.flatMap((d) => d.items)]
    .filter((i) => i && i.source === "roamroot" && i.coordinates)
    .map((i) => ({ _id: i.listingId, title: i.title, price: i.price, coordinates: i.coordinates }));
  const { estimate } = plan;

  const save = () => {
    const days = plan.itinerary.map((d, index) => {
      const items = d.items.map((i) => ({ listingId: i.listingId, title: i.title, time: i.time, notes: i.note }));
      if (index === 0 && plan.stay) items.unshift({ listingId: plan.stay.listingId, time: "14:00", notes: plan.stay.note });
      return { items };
    });
    onSave({ name: `${plan.days} days in ${plan.destination}`, destination: plan.destination, startDate, days, budget: estimate.budget || estimate.total, description: plan.summary });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="card p-6 sm:p-8">
        <p className="eyebrow">Your journey</p>
        <h2 className="mt-1 text-3xl sm:text-4xl">{plan.days} days in {plan.destination}</h2>
        <p className="mt-3 max-w-3xl text-charcoal/80">{plan.summary}</p>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted"><Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" /> Places, prices and ratings come from RoamRoot listings. Text marked as a suggestion is general and not a booking. {plan.aiWritten ? "The summary and tips were written by AI." : ""}</p>
        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="plan-start" className="label">Start date</label>
            <input id="plan-start" type="date" min={toInputDate(new Date())} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
          </div>
          <button type="button" onClick={save} disabled={saving || !startDate} className="btn-accent">{saving ? "Saving..." : "Save as a trip"}</button>
          <button type="button" onClick={onReset} className="btn-outline">Plan something else</button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {plan.stay && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-xl"><Home className="h-5 w-5 text-terracotta" aria-hidden="true" /> Where to stay</h3>
              <ul><PlanItem item={{ ...plan.stay, time: plan.stay.note }} /></ul>
            </div>
          )}
          {plan.itinerary.map((day) => (
            <section key={day.day} className="card p-5">
              <h3 className="mb-3 text-2xl">Day {day.day}</h3>
              <ul className="space-y-3">{day.items.map((item, i) => <PlanItem key={i} item={item} />)}</ul>
            </section>
          ))}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <MapView listings={mapListings} route className="h-72" />
          <div className="card p-5">
            <h3 className="text-xl">Estimated budget</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Stay ({Math.max(plan.days - 1, 1)} nights)</dt><dd>{formatPrice(estimate.stay)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Experiences</dt><dd>{formatPrice(estimate.activities)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Food (rough guess)</dt><dd>{formatPrice(estimate.food)}</dd></div>
              <div className="flex justify-between border-t border-sand pt-2 text-base font-semibold text-forest"><dt>Total</dt><dd>{formatPrice(estimate.total)}</dd></div>
            </dl>
            {estimate.withinBudget !== null && <p className={`mt-3 text-sm font-medium ${estimate.withinBudget ? "text-sage" : "text-terracotta"}`}>{estimate.withinBudget ? "Within your budget" : `Over your ${formatPrice(estimate.budget)} budget`}</p>}
            <p className="mt-3 text-xs text-muted">{estimate.note}</p>
          </div>
          <div className="card p-5">
            <h3 className="text-xl">Travel tips</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-charcoal/80">{plan.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </aside>
      </div>

      {[["Recommended experiences", plan.recommendedExperiences], ["Recommended places", plan.recommendedPlaces], ["Food suggestions", plan.foodSuggestions]].map(([title, list]) => list.length > 0 && (
        <section key={title} className="mt-12">
          <h3 className="mb-4 text-2xl">{title}</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{list.map((l) => <ListingCard key={l._id} listing={l} />)}</div>
        </section>
      ))}
    </div>
  );
}
