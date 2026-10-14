const Listing = require("../../models/Listing");
const Favorite = require("../../models/Favorite");
const Booking = require("../../models/Booking");
const Trip = require("../../models/Trip");

const lower = (list) => (list || []).map((t) => String(t).toLowerCase());

// Gives one listing a score for one traveller. Higher is better.
// score = interestMatch + categoryMatch + locationMatch + priceMatch + ratingScore + popularityScore
function scoreListing(listing, profile) {
  let score = 0;
  const reasons = [];
  const tags = lower(listing.tags);
  const category = listing.category.toLowerCase();

  // 1. interests (max 45)
  let interestPoints = 0;
  for (const interest of lower(profile.interests)) {
    if (tags.includes(interest) || category === interest || listing.title.toLowerCase().includes(interest)) {
      interestPoints += 15;
      reasons.push("Matches your interest in " + interest);
    }
  }
  score += Math.min(interestPoints, 45);

  // 2. category (max 10)
  if (profile.category && listing.category === profile.category) score += 10;
  else if ((profile.likedCategories || []).includes(listing.category)) {
    score += 6;
    reasons.push("Similar to places you saved");
  }

  // 3. location (max 25)
  const wanted = (profile.destination || "").toLowerCase();
  if (wanted && (listing.destination.toLowerCase() === wanted || listing.location.toLowerCase().includes(wanted))) {
    score += 25;
  } else if ((profile.knownDestinations || []).includes(listing.destination)) {
    score += 5;
  }

  // 4. price
  if (profile.maxPrice) {
    if (listing.price <= profile.maxPrice) score += 10;
    else score -= 20;
  }

  // 5. rating (max 20) and 6. popularity (max 15)
  score += listing.rating * 4;
  score += Math.min(listing.views / 100, 8) + Math.min(listing.reviewCount, 7);

  return { score, reasons };
}

// Learns a little about the user from what they saved, booked and planned
async function buildUserProfile(user) {
  const profile = { interests: [], likedCategories: [], knownDestinations: [], excludeIds: [] };
  if (!user) return profile;

  profile.interests = user.interests || [];
  const favorites = await Favorite.find({ user: user._id }).populate("listing", "category destination");
  const bookings = await Booking.find({ user: user._id }).populate("listing", "category destination");
  const trips = await Trip.find({ user: user._id }).select("destination");

  for (const item of [...favorites, ...bookings]) {
    if (!item.listing) continue;
    profile.likedCategories.push(item.listing.category);
    profile.knownDestinations.push(item.listing.destination);
    profile.excludeIds.push(String(item.listing._id));
  }
  profile.knownDestinations.push(...trips.map((t) => t.destination));
  return profile;
}

// Main function used by /api/ai/recommend, the home page and the chat assistant
async function getRecommendations({ user, destination, interests = [], maxPrice, category, limit = 8, types, excludeKnown = true, strictPrice = false }) {
  const profile = await buildUserProfile(user);
  profile.interests = [...new Set([...profile.interests, ...interests])];
  profile.destination = destination || "";
  profile.maxPrice = maxPrice;
  profile.category = category || "";

  const filter = { "availability.isAvailable": { $ne: false } };
  if (destination) {
    const safe = destination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // exact state/destination name, or a city inside the location text (e.g. "Mysore, Karnataka")
    filter.$or = [{ destination: new RegExp("^" + safe + "$", "i") }, { location: new RegExp(safe, "i") }];
  }
  if (types) filter.type = { $in: types };

  if (strictPrice && maxPrice) filter.price = { $lte: maxPrice }; // hard budget limit

  const candidates = await Listing.find(filter).limit(300).populate("creator", "name avatar");
  const results = candidates
    .filter((l) => !excludeKnown || !profile.excludeIds.includes(String(l._id)))
    .map((listing) => {
      const { score, reasons } = scoreListing(listing, profile);
      return { listing, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

module.exports = { scoreListing, getRecommendations, buildUserProfile };
