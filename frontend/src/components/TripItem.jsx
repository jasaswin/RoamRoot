import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Trash2, StickyNote } from "lucide-react";
import { firstImage, formatPrice } from "../lib/format";

// One activity inside a day of the trip
export default function TripItem({ item, isFirst, isLast, onMove, onDelete, onSave, days }) {
  const [notes, setNotes] = useState(item.notes || "");
  const [time, setTime] = useState(item.time || "");
  const listing = item.listing;

  const saveIfChanged = () => {
    if (notes !== (item.notes || "") || time !== (item.time || "")) onSave({ notes, time });
  };

  return (
    <motion.li layout transition={{ duration: 0.25 }} className="flex gap-4 rounded-2xl border border-sand/70 bg-white p-3">
      {listing ? (
        <img src={firstImage(listing, 200)} alt="" className="h-20 w-20 flex-shrink-0 rounded-xl object-cover" loading="lazy" />
      ) : (
        <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-sage-light text-forest"><StickyNote className="h-7 w-7" aria-hidden="true" /></span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {listing ? <Link to={`/listings/${listing._id}`} className="block truncate font-serif text-lg font-semibold text-forest hover:underline">{listing.title}</Link> : <p className="truncate font-serif text-lg font-semibold text-forest">{item.title}</p>}
            {listing && <p className="truncate text-sm text-muted">{listing.location} · {formatPrice(listing.price)}</p>}
          </div>
          <div className="flex flex-shrink-0">
            <button type="button" disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up" className="rounded-full p-1.5 text-muted hover:bg-cream disabled:opacity-30"><ArrowUp className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" disabled={isLast} onClick={() => onMove(1)} aria-label="Move down" className="rounded-full p-1.5 text-muted hover:bg-cream disabled:opacity-30"><ArrowDown className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={onDelete} aria-label="Remove from trip" className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} onBlur={saveIfChanged} aria-label="Time" className="input !w-28 !py-1.5" />
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveIfChanged} placeholder="Add a note" aria-label="Notes" className="input min-w-0 flex-1 !py-1.5" />
          <select aria-label="Move to day" value="" onChange={(e) => e.target.value && onSave({ date: e.target.value, order: 99 })} className="input !w-auto !py-1.5">
            <option value="">Move to...</option>
            {days.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>
    </motion.li>
  );
}
