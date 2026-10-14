import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Modal from "./Modal";
import { imageUrl } from "../lib/format";

// Desktop: one big image + a grid. Mobile: swipe left and right. Click opens a full-size viewer.
export default function ImageGallery({ images = [], title }) {
  const [openIndex, setOpenIndex] = useState(null);
  const list = images.length ? images : [{ url: "" }];

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setOpenIndex((i) => (i + 1) % list.length);
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, list.length]);

  const alt = (i) => `${title} photo ${i + 1} of ${list.length}`;

  return (
    <>
      {/* Desktop grid */}
      <div className="relative hidden h-[460px] grid-cols-4 grid-rows-2 gap-3 overflow-hidden rounded-[2rem] md:grid">
        {list.slice(0, 5).map((img, i) => (
          <button key={i} type="button" onClick={() => setOpenIndex(i)} aria-label={`Open ${alt(i)}`} className={`relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""} ${list.length === 1 ? "col-span-4" : ""}`}>
            <img src={imageUrl(img.url, i === 0 ? 1200 : 600)} alt={alt(i)} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
          </button>
        ))}
        <button type="button" onClick={() => setOpenIndex(0)} className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest shadow-card">
          <Expand className="h-4 w-4" aria-hidden="true" /> View all {list.length} photo{list.length > 1 ? "s" : ""}
        </button>
      </div>

      {/* Mobile swipe gallery */}
      <div className="relative md:hidden">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-3xl">
          {list.map((img, i) => (
            <img key={i} src={imageUrl(img.url, 900)} alt={alt(i)} onClick={() => setOpenIndex(i)} className="aspect-[4/3] w-full flex-shrink-0 snap-center object-cover" loading={i === 0 ? "eager" : "lazy"} />
          ))}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-forest-deep/80 px-3 py-1 text-xs font-semibold text-cream">{list.length} photos · swipe</span>
      </div>

      <Modal open={openIndex !== null} onClose={() => setOpenIndex(null)} title={title} wide>
        {openIndex !== null && (
          <div className="relative">
            <img src={imageUrl(list[openIndex].url, 1600)} alt={alt(openIndex)} className="max-h-[65vh] w-full rounded-2xl object-contain" />
            {list.length > 1 && (
              <>
                <button type="button" aria-label="Previous photo" onClick={() => setOpenIndex((openIndex - 1 + list.length) % list.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
                <button type="button" aria-label="Next photo" onClick={() => setOpenIndex((openIndex + 1) % list.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
              </>
            )}
            <p className="mt-2 text-center text-sm text-muted">{openIndex + 1} / {list.length}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
