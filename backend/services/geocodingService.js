// Turns a place name into coordinates using OpenStreetMap Nominatim (free, no key needed).
// The old project used Mapbox, but its token was never set, so we use OSM instead.
exports.geocode = async (query) => {
  const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(query);
  const response = await fetch(url, { headers: { "User-Agent": "RoamRoot/1.0" } });
  if (!response.ok) return null;
  const results = await response.json();
  if (!results.length) return null;
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
};
