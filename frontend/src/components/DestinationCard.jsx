import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function DestinationCard({ destination, count, className = "" }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={className}>
      <Link to={`/discover?destination=${encodeURIComponent(destination.name)}`} className="group relative block h-full min-h-[220px] overflow-hidden rounded-3xl">
        <img src={destination.image} alt={`${destination.name} landscape`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/10 to-transparent" aria-hidden="true" />
        <div className="relative flex h-full min-h-[220px] flex-col justify-end p-5 text-cream">
          <h3 className="font-serif text-2xl !text-cream">{destination.name}</h3>
          <p className="text-sm text-cream/85">{destination.text}</p>
          {count > 0 && <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-terracotta-soft">{count} things to do</p>}
        </div>
      </Link>
    </motion.div>
  );
}
