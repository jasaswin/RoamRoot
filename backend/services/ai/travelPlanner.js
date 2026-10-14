const { getRecommendations } = require("./recommendationService");
const { askAIForJSON } = require("./aiProvider");

const PARTY_SIZE = { Solo: 1, Couple: 2, Family: 4, Friends: 4 };
const SLOTS = { Relaxed: ["10:00", "16:00"], Balanced: ["09:00", "13:00", "17:00"], Packed: ["08:00", "11:00", "14:00", "17:00"] };
const FOOD_PER_PERSON_PER_DAY = 600; // rough estimate in INR, shown to the user as an estimate

// Distance in km between two coordinates (straight line)
function distanceKm(a, b) {
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Short version of a listing for the planner result (the price comes from the database)
function toPlanItem(listing, time, note) {
  return {
    source: "roamroot",
    listingId: listing._id,
    title: listing.title,
    type: listing.type,
    category: listing.category,
    location: listing.location,
    price: listing.price,
    rating: listing.rating,
    image: listing.images[0] ? listing.images[0].url : "",
    coordinates: listing.coordinates,
    time,
    note,
  };
}

// Builds the day-by-day plan. Everything comes from real listings in the database.
async function planTrip(input, user) {
  const { destination, days, budget, party, interests, style, pace } = input;
  const partySize = PARTY_SIZE[party] || 1;
  const wanted = [...interests, ...(style ? [style] : [])].map((s) => s.toLowerCase());
  const dailyBudget = budget ? budget / days : 0;

  const all = await getRecommendations({
    user,
    destination,
    interests: wanted,
    maxPrice: dailyBudget ? Math.round(dailyBudget * 0.6) : undefined,
    limit: 100,
    excludeKnown: false, // saved places are welcome in a plan
  });

  // The destination is not in RoamRoot yet
  if (all.length === 0) {
    const suggestions = await getRecommendations({ user, interests: wanted, limit: 4 });
    return {
      supported: false,
      destination,
      message: `RoamRoot doesn't have listings for ${destination} yet. Here are some popular places you may like instead.`,
      suggestions: suggestions.map((r) => r.listing),
    };
  }

  const stays = all.filter((r) => r.listing.type === "STAY");
  const foods = all.filter((r) => r.listing.category === "Food" && r.listing.type !== "STAY");
  const activities = all.filter((r) => r.listing.type !== "STAY" && r.listing.category !== "Food");

  // choose a stay: fits the group and, if a budget was given, a bit under 45% of the daily budget
  const nights = Math.max(days - 1, 1);
  const fitsGroup = stays.filter((r) => r.listing.capacity >= partySize);
  const stayPool = fitsGroup.length ? fitsGroup : stays;
  const affordable = dailyBudget ? stayPool.filter((r) => r.listing.price <= dailyBudget * 0.45) : stayPool;
  const stay = (affordable[0] || stayPool[0] || {}).listing || null;

  // fill each day: one anchor activity, then the nearest ones to it
  const slots = SLOTS[pace] || SLOTS.Balanced;
  const pool = activities.map((r) => r);
  const itinerary = [];
  const usedFood = [];

  for (let day = 1; day <= days; day++) {
    const items = [];
    const anchor = pool.shift();
    if (anchor) {
      items.push(anchor);
      while (items.length < slots.length && pool.length) {
        const nearest = pool
          .slice(0, 10)
          .sort((a, b) => distanceKm(anchor.listing.coordinates, a.listing.coordinates) - distanceKm(anchor.listing.coordinates, b.listing.coordinates))[0];
        pool.splice(pool.indexOf(nearest), 1);
        items.push(nearest);
      }
    }

    const dayItems = items.map((r, i) => toPlanItem(r.listing, slots[i], r.reasons[0] || "Highly rated in " + destination));
    // one food suggestion per day when available
    const food = foods.find((r) => !usedFood.includes(String(r.listing._id)));
    if (food) {
      usedFood.push(String(food.listing._id));
      dayItems.push(toPlanItem(food.listing, "19:30", "Food pick for the evening"));
    }
    if (dayItems.length === 0) {
      dayItems.push({ source: "generated", title: "Free day to wander and relax", time: "10:00", note: "No more RoamRoot listings left for this day" });
    }
    itinerary.push({ day, title: `Day ${day}`, items: dayItems });
  }

  // budget estimate (prices are real database prices, food is a rough estimate)
  const planned = itinerary.flatMap((d) => d.items).filter((i) => i.source === "roamroot");
  const activityCost = planned.reduce((sum, i) => sum + i.price * partySize, 0);
  const stayCost = stay ? stay.price * nights : 0;
  const foodCost = FOOD_PER_PERSON_PER_DAY * partySize * days;
  const total = stayCost + activityCost + foodCost;

  const plan = {
    supported: true,
    destination,
    days,
    party,
    pace,
    stay: stay ? toPlanItem(stay, "Check-in", `${nights} night${nights > 1 ? "s" : ""} stay`) : null,
    itinerary,
    recommendedExperiences: all.filter((r) => ["EXPERIENCE", "ACTIVITY", "EVENT"].includes(r.listing.type)).slice(0, 4).map((r) => r.listing),
    recommendedPlaces: all.filter((r) => r.listing.type === "PLACE").slice(0, 4).map((r) => r.listing),
    foodSuggestions: foods.slice(0, 4).map((r) => r.listing),
    estimate: {
      stay: stayCost,
      activities: activityCost,
      food: foodCost,
      total,
      perPerson: Math.round(total / partySize),
      budget: budget || 0,
      withinBudget: budget ? total <= budget : null,
      note: "Stay and activity prices come from RoamRoot listings. Food is a rough estimate. Nothing here is booked.",
    },
    summary: `A ${days}-day ${style ? style.toLowerCase() + " " : ""}trip to ${destination} for ${party.toLowerCase()}, built from real RoamRoot listings.`,
    tips: [
      "Prices and availability can change, so check each listing before you book.",
      "Plan the activities of one day in the same area to save travel time.",
    ],
    aiWritten: false,
  };

  // Optional: let the AI write a nicer summary and tips. It only gets the titles we already chose.
  const titles = planned.map((i) => i.title).join(", ");
  const ai = await askAIForJSON(
    "You are a friendly travel writer for RoamRoot. Never invent places, prices or availability.",
    `Write JSON {"summary": string (max 300 chars), "tips": string[] (3 items, general travel tips for ${destination})} for a ${days}-day ${party} trip to ${destination} using only these places: ${titles}.`
  );
  if (ai && typeof ai.summary === "string" && Array.isArray(ai.tips)) {
    plan.summary = ai.summary.slice(0, 400);
    plan.tips = ai.tips.filter((t) => typeof t === "string").slice(0, 5).map((t) => t.slice(0, 200));
    plan.aiWritten = true;
  }
  return plan;
}

module.exports = { planTrip };
