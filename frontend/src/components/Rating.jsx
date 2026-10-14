import { Star } from "lucide-react";

// Small rating label: ★ 4.8 (12)
export default function Rating({ value = 0, count = 0, className = "" }) {
  if (!count) return <span className={`text-xs font-medium text-sage ${className}`}>New</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`} aria-label={`Rated ${value} out of 5 from ${count} reviews`}>
      <Star className="h-4 w-4 fill-terracotta text-terracotta" aria-hidden="true" />
      <span className="font-semibold text-charcoal">{value.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}
