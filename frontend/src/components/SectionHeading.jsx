import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({ eyebrow, title, text, linkTo, linkLabel = "See all", light = false }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className={`text-3xl sm:text-4xl ${light ? "!text-cream" : ""}`}>{title}</h2>
        {text && <p className={`mt-2 ${light ? "text-cream/80" : "text-muted"}`}>{text}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className={`inline-flex items-center gap-1 text-sm font-semibold ${light ? "text-cream" : "text-forest"} hover:gap-2 transition-all`}>
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
