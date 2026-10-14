import { Link } from "react-router-dom";
import { Camera, MessageCircle, Play } from "lucide-react";

const columns = [
  { title: "Discover", links: [["Discover", "/discover"], ["Experiences", "/experiences"], ["Stays", "/stays"], ["Places", "/places"], ["Stories", "/stories"]] },
  { title: "RoamRoot", links: [["Plan with AI", "/ai-planner"], ["Become a Creator", "/creator/dashboard"], ["Saved", "/saved"], ["Trips", "/trips"]] },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-forest-deep text-cream/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/images/brand/roamroot-logo-white.svg" alt="RoamRoot" className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-sm">Discover places. Experience more. Plan your journey. RoamRoot helps you find stays, experiences and hidden gems hosted by local people.</p>
          <div className="mt-5 flex gap-3">
            {[[Camera, "Instagram"], [MessageCircle, "Twitter"], [Play, "YouTube"]].map(([Icon, label]) => (
              <a key={label} href="https://example.com" target="_blank" rel="noreferrer" aria-label={label} className="rounded-full border border-cream/20 p-2 hover:bg-cream/10"><Icon className="h-4 w-4" aria-hidden="true" /></a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider !text-cream">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map(([label, to]) => <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-xs">
          <p>© {new Date().getFullYear()} RoamRoot. Demo project: bookings are app-level only and no payment is taken.</p>
          <p className="flex gap-4">
            <span>About</span><span>Help</span><span>Privacy</span><span>Terms</span><span>Contact</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
