import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { MapPinOff } from "lucide-react";
import { firstImage, formatPrice } from "../lib/format";

const INDIA_CENTER = [22.5, 79];

// A round terracotta pin. The selected one is dark green and bigger.
const makeIcon = (active) =>
  L.divIcon({
    className: "",
    html: `<div class="rr-pin ${active ? "rr-pin-active" : ""}" style="width:${active ? 34 : 26}px;height:${active ? 34 : 26}px"></div>`,
    iconSize: active ? [34, 34] : [26, 26],
    iconAnchor: active ? [17, 34] : [13, 26],
    popupAnchor: [0, -28],
  });

// Zooms the map so every marker is visible, or flies to the selected one
function MapController({ points, activePoint }) {
  const map = useMap();
  useEffect(() => {
    if (activePoint) {
      map.flyTo(activePoint, Math.max(map.getZoom(), 10), { duration: 0.6 });
    } else if (points.length === 1) {
      map.setView(points[0], 11);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 11 });
    }
  }, [points, activePoint, map]);
  return null;
}

// listings: [{ _id, title, coordinates: {lat, lng}, ... }]
export default function MapView({ listings = [], activeId = null, onSelect, route = false, className = "h-96", scrollZoom = false }) {
  const withCoords = listings.filter((l) => l.coordinates && typeof l.coordinates.lat === "number");
  const points = withCoords.map((l) => [l.coordinates.lat, l.coordinates.lng]);
  const active = withCoords.find((l) => l._id === activeId);

  if (withCoords.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-3xl border border-sand bg-white text-center text-muted ${className}`}>
        <MapPinOff className="mb-2 h-8 w-8" aria-hidden="true" />
        <p className="text-sm">No map location available yet</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-sand ${className}`}>
      <MapContainer center={points[0] || INDIA_CENTER} zoom={6} scrollWheelZoom={scrollZoom} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController points={points} activePoint={active ? [active.coordinates.lat, active.coordinates.lng] : null} />
        {route && points.length > 1 && <Polyline positions={points} pathOptions={{ color: "#C86B4A", weight: 3, dashArray: "6 8" }} />}
        {withCoords.map((l) => (
          <Marker
            key={l._id}
            position={[l.coordinates.lat, l.coordinates.lng]}
            icon={makeIcon(l._id === activeId)}
            zIndexOffset={l._id === activeId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(l._id) }}
          >
            <Popup>
              <div className="w-40">
                {l.images?.[0] && <img src={firstImage(l, 300)} alt="" className="mb-2 h-20 w-full rounded-lg object-cover" />}
                <p className="font-semibold text-forest">{l.title}</p>
                {l.price !== undefined && <p className="text-xs text-muted">{formatPrice(l.price)}</p>}
                <Link to={`/listings/${l._id}`} className="text-xs font-semibold text-terracotta">View details</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
