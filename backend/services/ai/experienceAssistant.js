const Listing = require("../../models/Listing");
const Favorite = require("../../models/Favorite");
const { getRecommendations } = require("./recommendationService");
const { planTrip } = require("./travelPlanner");
const { askAI } = require("./aiProvider");

// Words people type -> tags used in our listings
const KEYWORDS = {
  hiking: ["hiking", "trekking"], hike: ["hiking"], trek: ["trekking"], trekking: ["trekking"],
  photography: ["photography"], photo: ["photography"], food: ["food"], cooking: ["food"],
  yoga: ["yoga", "wellness"], wellness: ["wellness"], spa: ["wellness"], peaceful: ["slow-travel", "nature"],
  quiet: ["slow-travel", "nature"], relax: ["slow-travel", "wellness"], weekend: ["weekend"],
  beach: ["beach"], culture: ["culture"], heritage: ["heritage"], camping: ["camping"],
  adventure: ["adventure"], nature: ["nature"], pottery: ["art"], art: ["art"], kayaking: ["water"],
};

function readMoney(text) {
  const match = text.match(/(?:under|below|less than|within|upto|up to|max)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
  return match ? Number(match[1].replace(/,/g, "")) : undefined;
}

function shortList(listings) {
  return listings.map((l) => ({
    _id: l._id,
    title: l.title,
    location: l.location,
    price: l.price,
    type: l.type,
    rating: l.rating,
    image: l.images[0] ? l.images[0].url : "",
  }));
}

// Optionally lets the AI rewrite our plain reply. It only sees facts we already found.
async function polish(plainReply, facts) {
  const text = await askAI(
    "You are RoamRoot's friendly travel assistant. Use ONLY the facts given. Do not invent places, prices or availability. Keep it under 80 words.",
    `Facts: ${JSON.stringify(facts)}\nDraft reply: ${plainReply}\nRewrite the draft so it sounds warm and natural.`
  );
  return text ? text.trim() : plainReply;
}

async function chat({ message, user, context = {} }) {
  const lowerMessage = message.toLowerCase();
  const destinations = await Listing.distinct("destination");
  // known names: states/destinations plus the city part of each location, e.g. "Mysore"
  const locations = await Listing.distinct("location");
  const cities = locations.map((l) => l.split(",")[0].trim()).filter((c) => c.length > 3);
  const knownNames = [...destinations, ...cities];
  let destination = knownNames.find((d) => lowerMessage.includes(d.toLowerCase())) || context.destination || "";
  // if the user is looking at a listing, use its destination
  if (!destination && context.listingId && /^[a-f0-9]{24}$/i.test(context.listingId)) {
    const current = await Listing.findById(context.listingId).select("destination");
    if (current) destination = current.destination;
  }

  // 1. "Help me organize my saved places"
  if (/saved|wishlist|organi[sz]e/.test(lowerMessage)) {
    if (!user) return { reply: "Log in and I can help you organise your saved places.", listings: [] };
    const favorites = await Favorite.find({ user: user._id }).populate("listing");
    const saved = favorites.map((f) => f.listing).filter(Boolean);
    if (saved.length === 0) return { reply: "You haven't saved anything yet. Tap the heart on any listing to start your list.", listings: [] };
    const groups = {};
    saved.forEach((l) => (groups[l.destination] = (groups[l.destination] || 0) + 1));
    const summary = Object.entries(groups).map(([place, n]) => `${n} in ${place}`).join(", ");
    return { reply: `You have ${saved.length} saved places: ${summary}. Pick a destination and say "plan 3 days in ..." and I'll build a trip.`, listings: shortList(saved.slice(0, 4)) };
  }

  const interests = [];
  Object.keys(KEYWORDS).forEach((word) => {
    if (lowerMessage.includes(word)) interests.push(...KEYWORDS[word]);
  });
  const maxPrice = readMoney(message);

  // 2. "Suggest a 3-day Kerala trip"
  const daysMatch = lowerMessage.match(/(\d+)\s*-?\s*(?:day|days|night)/);
  if (daysMatch && destination) {
    const days = Math.min(Number(daysMatch[1]), 14);
    const plan = await planTrip({ destination, days, budget: 0, party: "Solo", interests: [...new Set(interests)], style: "", pace: "Balanced" }, user);
    if (!plan.supported) return { reply: plan.message, listings: shortList(plan.suggestions) };
    const picks = plan.itinerary.flatMap((d) => d.items).filter((i) => i.source === "roamroot").slice(0, 4);
    const plain = `Here's a ${days}-day ${destination} idea built from RoamRoot listings. Estimated total is about ₹${plan.estimate.total.toLocaleString("en-IN")} for one person. You can fine-tune it in the AI Planner.`;
    return { reply: await polish(plain, { destination, days, picks: picks.map((p) => p.title) }), listings: picks.map((p) => ({ _id: p.listingId, title: p.title, location: p.location, price: p.price, type: p.type, rating: p.rating, image: p.image })), planDestination: destination, planDays: days };
  }

  // 3. everything else: recommendations
  let types;
  if (/\bstays?\b|hotel|cabin|homestay/.test(lowerMessage)) types = ["STAY"];
  else if (/experiences?|activit/.test(lowerMessage)) types = ["EXPERIENCE", "ACTIVITY", "EVENT"];
  else if (/\bplaces?\b|visit|see/.test(lowerMessage)) types = ["PLACE"];
  const results = await getRecommendations({ user, destination, interests: [...new Set(interests)], maxPrice, limit: 4, types, strictPrice: true });
  if (results.length === 0) {
    return { reply: destination ? `I couldn't find listings in ${destination} that match that yet. Try another destination or fewer filters.` : "I couldn't find a match. Try telling me a destination or what you enjoy, like hiking or food.", listings: [] };
  }
  const listings = results.map((r) => r.listing);
  const where = destination ? ` in ${destination}` : "";
  const price = maxPrice ? ` under ₹${maxPrice.toLocaleString("en-IN")}` : "";
  const plain = `I found ${listings.length} ideas${where}${price}. Top pick: ${listings[0].title} (${listings[0].location}).`;
  return { reply: await polish(plain, { picks: listings.map((l) => ({ title: l.title, price: l.price })) }), listings: shortList(listings) };
}

module.exports = { chat };
