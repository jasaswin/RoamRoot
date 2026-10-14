// Simple end-to-end API test. Start the server first (npm run dev) and seed the database (npm run seed).
// Run with: npm test   (set API_URL if your server is not on port 8080)
const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 8080}/api`;
let passed = 0;
let failed = 0;

// Each "client" keeps its own cookie, like a browser would
function makeClient() {
  let cookie = "";
  return async (method, path, body) => {
    const res = await fetch(BASE + path, {
      method,
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    const json = await res.json();
    return { status: res.status, ...json };
  };
}

function check(name, condition, extra = "") {
  if (condition) {
    passed++;
    console.log("  ok   " + name);
  } else {
    failed++;
    console.log("  FAIL " + name + " " + extra);
  }
}

async function run() {
  const guest = makeClient();
  const demo = makeClient();
  const creator = makeClient();
  const other = makeClient();
  const admin = makeClient();

  console.log("Auth");
  let r = await guest("GET", "/auth/me");
  check("me without login returns no user", r.status === 200 && r.data.user === null);
  r = await guest("POST", "/auth/register", { name: "A", email: "bad", password: "1" });
  check("register validation gives 400", r.status === 400);
  const email = `test${Date.now()}@example.com`;
  r = await other("POST", "/auth/register", { name: "Test Person", email, password: "secret123" });
  check("register works", r.status === 201 && r.data.user.role === "USER");
  check("password hash is never returned", !JSON.stringify(r).includes("passwordHash"));
  r = await other("POST", "/auth/login", { email, password: "wrong-password" });
  check("wrong password is 401", r.status === 401);
  r = await demo("POST", "/auth/login", { email: "demo@roamroot.com", password: "Password@123" });
  check("demo login works", r.status === 200);
  await creator("POST", "/auth/login", { email: "creator@roamroot.com", password: "Password@123" });
  await admin("POST", "/auth/login", { email: "admin@roamroot.com", password: "Password@123" });
  r = await demo("GET", "/auth/me");
  check("me works with cookie", r.status === 200 && r.data.user.email === "demo@roamroot.com");

  console.log("Listings and search");
  r = await guest("GET", "/listings?limit=5");
  check("list returns pagination", r.status === 200 && r.data.items.length === 5 && r.data.pagination.total >= 20);
  r = await guest("GET", "/listings?type=STAY");
  check("type filter works", r.data.items.length > 0 && r.data.items.every((l) => l.type === "STAY"));
  r = await guest("GET", "/listings?destination=Goa&maxPrice=1000");
  check("destination + price filter works", r.data.items.length > 0 && r.data.items.every((l) => l.price <= 1000 && l.destination === "Goa"));
  r = await guest("GET", "/listings?q=pottery");
  check("keyword search works", r.data.items.length >= 1);
  r = await guest("GET", "/listings?q=.*(");
  check("odd search text does not crash", r.status === 200);
  const listingId = (await guest("GET", "/listings?type=EXPERIENCE&limit=1")).data.items[0]._id;
  r = await guest("GET", "/listings/" + listingId);
  check("listing detail works", r.status === 200 && r.data.listing.creator.name);
  r = await guest("GET", "/listings/not-an-id");
  check("bad id is 400", r.status === 400);

  console.log("Listing permissions");
  const newListing = {
    title: "Test Sunset Walk", description: "A short test walk through the old town at sunset time.", type: "EXPERIENCE",
    category: "Culture", price: 500, location: "Test Town", destination: "Goa", coordinates: { lat: 15.3, lng: 74.0 }, capacity: 5,
  };
  r = await guest("POST", "/listings", newListing);
  check("guest cannot create listing (401)", r.status === 401);
  r = await demo("POST", "/listings", newListing);
  check("normal user cannot create listing (403)", r.status === 403);
  r = await creator("POST", "/listings", { ...newListing, price: -5 });
  check("invalid listing is 400", r.status === 400);
  r = await creator("POST", "/listings", newListing);
  check("creator can create listing", r.status === 201);
  const myListingId = r.data.listing._id;
  r = await other("POST", "/auth/become-creator");
  check("user can become creator", r.data.user.role === "CREATOR");
  r = await other("PUT", "/listings/" + myListingId, newListing);
  check("another creator cannot edit it (403)", r.status === 403);
  r = await creator("PUT", "/listings/" + myListingId, { ...newListing, title: "Test Sunset Walk Edited" });
  check("owner can edit", r.status === 200 && r.data.listing.title.endsWith("Edited"));

  console.log("Reviews");
  r = await guest("POST", `/listings/${myListingId}/reviews`, { rating: 5, comment: "Great" });
  check("guest cannot review", r.status === 401);
  r = await demo("POST", `/listings/${myListingId}/reviews`, { rating: 9, comment: "Great walk" });
  check("rating 9 is rejected", r.status === 400);
  r = await demo("POST", `/listings/${myListingId}/reviews`, { rating: 4, title: "Nice", comment: "Great walk indeed" });
  check("review created", r.status === 201);
  const reviewId = r.data.review._id;
  r = await demo("POST", `/listings/${myListingId}/reviews`, { rating: 4, comment: "Again" });
  check("second review by same user is 409", r.status === 409);
  r = await guest("GET", `/listings/${myListingId}`);
  check("listing rating updated", r.data.listing.rating === 4 && r.data.listing.reviewCount === 1);
  r = await other("DELETE", "/reviews/" + reviewId);
  check("other user cannot delete review (403)", r.status === 403);
  r = await demo("DELETE", "/reviews/" + reviewId);
  check("author can delete review", r.status === 200);

  console.log("Favorites");
  r = await demo("POST", "/favorites/" + listingId);
  check("save listing", r.status === 201);
  r = await demo("GET", "/favorites");
  check("saved list contains it", r.data.listings.some((l) => l._id === listingId));
  r = await demo("DELETE", "/favorites/" + listingId);
  check("remove favorite", r.status === 200);

  console.log("Bookings");
  const future = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
  r = await demo("POST", "/bookings", { listing: myListingId, checkIn: "2020-01-01", guests: 2 });
  check("past date rejected", r.status === 400);
  r = await demo("POST", "/bookings", { listing: myListingId, checkIn: future, guests: 50 });
  check("over capacity rejected", r.status === 400);
  r = await demo("POST", "/bookings", { listing: myListingId, checkIn: future, guests: 2 });
  check("booking created with server price", r.status === 201 && r.data.booking.totalPrice === 1000 && r.data.booking.bookingReference.startsWith("RR-"));
  const bookingId = r.data.booking._id;
  r = await other("GET", "/bookings/" + bookingId);
  check("stranger cannot see booking (403)", r.status === 403);
  r = await creator("GET", "/bookings/" + bookingId);
  check("listing creator can see booking", r.status === 200);
  r = await demo("PATCH", "/bookings/" + bookingId, { status: "CONFIRMED" });
  check("guest cannot confirm own booking (403)", r.status === 403);
  r = await creator("PATCH", "/bookings/" + bookingId, { status: "CONFIRMED" });
  check("creator confirms booking", r.status === 200 && r.data.booking.status === "CONFIRMED");
  const stay = (await guest("GET", "/listings?type=STAY&limit=1")).data.items[0];
  r = await demo("POST", "/bookings", { listing: stay._id, checkIn: future, checkOut: future, guests: 1 });
  check("stay with same check-out date rejected", r.status === 400);

  console.log("Trips");
  r = await demo("POST", "/trips", { name: "Test trip", destination: "Goa", startDate: future, endDate: "2000-01-01" });
  check("end before start rejected", r.status === 400);
  r = await demo("POST", "/trips", { name: "Test trip", destination: "Goa", startDate: future, endDate: future, budget: 5000 });
  check("trip created", r.status === 201);
  const tripId = r.data.trip._id;
  r = await demo("POST", `/trips/${tripId}/items`, { listing: listingId, date: future, time: "09:00" });
  check("trip item added", r.status === 201);
  const itemId = r.data.item._id;
  r = await demo("POST", `/trips/${tripId}/items`, { date: future, title: "Pack bags" });
  check("note item added", r.status === 201);
  r = await demo("PUT", `/trips/${tripId}/items/${itemId}`, { notes: "Bring water", order: 3 });
  check("trip item updated", r.status === 200 && r.data.item.notes === "Bring water");
  r = await other("GET", "/trips/" + tripId);
  check("other user cannot open my trip (403)", r.status === 403);
  r = await demo("GET", "/trips/" + tripId);
  check("trip detail has items", r.data.items.length === 2);
  r = await demo("POST", "/trips/from-plan", { name: "Plan trip", destination: "Goa", startDate: future, days: [{ items: [{ listingId: listingId, time: "10:00" }] }, { items: [] }] });
  check("trip from AI plan", r.status === 201);
  r = await demo("DELETE", `/trips/${tripId}/items/${itemId}`);
  check("trip item deleted", r.status === 200);
  r = await demo("DELETE", "/trips/" + tripId);
  check("trip deleted", r.status === 200);

  console.log("Stories");
  r = await demo("POST", "/stories", { title: "My test story", content: "Short" });
  check("short story rejected", r.status === 400);
  r = await demo("POST", "/stories", { title: "My test story", content: "This is a long enough story content to pass validation easily, about a lovely trip." });
  check("story created", r.status === 201);
  const storyId = r.data.story._id;
  r = await other("DELETE", "/stories/" + storyId);
  check("other user cannot delete story (403)", r.status === 403);
  r = await demo("POST", `/stories/${storyId}/like`);
  check("like works", r.status === 200 && r.data.likes === 1);
  r = await admin("DELETE", "/stories/" + storyId);
  check("admin can delete any story", r.status === 200);
  r = await guest("GET", "/stories");
  check("stories list paginated", r.data.items.length >= 6 && r.data.pagination.total >= 6);

  console.log("Creator");
  r = await demo("GET", "/creator/dashboard");
  check("normal user blocked from dashboard (403)", r.status === 403);
  r = await creator("GET", "/creator/dashboard");
  check("dashboard has totals and 6 months", r.status === 200 && r.data.totals.listings > 0 && r.data.monthly.length === 6);
  r = await creator("GET", "/creator/bookings");
  check("creator bookings", r.status === 200 && r.data.bookings.length > 0);
  r = await creator("GET", "/creator/analytics");
  check("analytics works", r.status === 200 && Array.isArray(r.data.topExperiences));
  const creatorId = (await guest("GET", "/listings/" + listingId)).data.listing.creator._id;
  r = await guest("GET", "/creator/profile/" + creatorId);
  check("public creator profile", r.status === 200 && r.data.listings.length > 0);
  r = await creator("DELETE", "/listings/" + myListingId);
  check("owner deletes listing", r.status === 200);

  console.log("Admin");
  r = await demo("GET", "/admin/users");
  check("normal user blocked from admin (403)", r.status === 403);
  r = await admin("GET", "/admin/users");
  check("admin lists users", r.status === 200 && r.data.users.length >= 9);

  console.log("AI");
  r = await demo("POST", "/ai/plan-trip", { destination: "Kerala", days: 3, budget: 30000, party: "Couple", interests: ["nature", "food"], pace: "Balanced" });
  check("AI plan works", r.status === 200 && r.data.plan.supported && r.data.plan.itinerary.length === 3);
  check("plan uses real listings", r.data.plan.itinerary[0].items.every((i) => i.source !== "roamroot" || i.listingId));
  r = await demo("POST", "/ai/plan-trip", { destination: "Atlantis", days: 2 });
  check("unknown destination handled", r.status === 200 && r.data.plan.supported === false);
  r = await guest("POST", "/ai/recommend", { interests: ["hiking"], limit: 4 });
  check("recommendations work", r.status === 200 && r.data.recommendations.length > 0);
  r = await guest("POST", "/ai/chat", { message: "Suggest a 3-day Kerala trip" });
  check("assistant plans a trip", r.status === 200 && r.data.listings.length > 0);
  r = await guest("POST", "/ai/chat", { message: "Show me experiences under 1000 in Goa" });
  check("assistant uses budget", r.status === 200 && r.data.listings.every((l) => l.price <= 1000), JSON.stringify(r.data.listings && r.data.listings.map((l) => l.price)));
  r = await guest("POST", "/ai/chat", { message: "" });
  check("empty chat message rejected", r.status === 400);

  console.log("Other");
  r = await guest("GET", "/nothing-here");
  check("unknown route is 404 JSON", r.status === 404 && r.success === false);
  r = await guest("POST", "/uploads");
  check("upload needs login", r.status === 401);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error("Test crashed:", err.message);
  process.exit(1);
});
