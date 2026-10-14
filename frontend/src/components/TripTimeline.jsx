import { formatDate } from "../lib/format";
import TripItem from "./TripItem";

// Shows the trip day by day like a travel journal. `days` = [{ date: Date, key: "2026-11-03" }]
export default function TripTimeline({ days, items, onMove, onDelete, onSave, onAdd }) {
  const dayOptions = days.map((d, i) => ({ value: d.key, label: `Day ${i + 1}` }));

  return (
    <ol className="relative space-y-10 border-l-2 border-dashed border-sage-light pl-6 sm:pl-8">
      {days.map((day, index) => {
        const dayItems = items.filter((item) => item.date.slice(0, 10) === day.key).sort((a, b) => a.order - b.order || (a.time || "").localeCompare(b.time || ""));
        return (
          <li key={day.key} className="relative">
            <span className="absolute -left-[2.15rem] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white sm:-left-[2.65rem]" aria-hidden="true">{index + 1}</span>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-2xl">Day {index + 1} <span className="font-sans text-base font-normal text-muted">· {formatDate(day.date, "EEEE, d MMMM")}</span></h3>
              <button type="button" onClick={() => onAdd(day.key)} className="btn-outline !px-4 !py-1.5">+ Add activity</button>
            </div>
            {dayItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-sand p-4 text-sm text-muted">Nothing planned yet. Add an experience, a stay or a note.</p>
            ) : (
              <ul className="space-y-3">
                {dayItems.map((item, i) => (
                  <TripItem key={item._id} item={item} days={dayOptions} isFirst={i === 0} isLast={i === dayItems.length - 1} onMove={(step) => onMove(dayItems, i, step)} onDelete={() => onDelete(item)} onSave={(patch) => onSave(item, patch)} />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
