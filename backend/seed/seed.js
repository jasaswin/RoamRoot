// Run with: npm run seed
// Fills the RoamRoot database with demo data. It only clears the RoamRoot collections
// (inside DB_NAME, default "roamroot"), never your your old data.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const generateBookingReference = require("../utils/generateBookingReference");
const data = require("./seedData");

const User = require("../models/User");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Favorite = require("../models/Favorite");
const Trip = require("../models/Trip");
const TripItem = require("../models/TripItem");
const TravelStory = require("../models/TravelStory");

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => {
  const d = new Date(Date.now() + n * DAY);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

async function seed() {
  await connectDB();

  for (const Model of [User, Listing, Review, Booking, Favorite, Trip, TripItem, TravelStory]) {
    await Model.deleteMany({});
  }

  // ---- users ----
  const passwordHash = await bcrypt.hash("Password@123", 10);
  const users = {};
  for (const u of data.users) {
    const { key, ...fields } = u;
    users[key] = await User.create({ ...fields, passwordHash });
  }

  // ---- listings ----
  const listings = [];
  let n = 0;
  for (const l of data.listings) {
    n++;
    const listing = await Listing.create({
      title: l.title,
      description: l.description,
      type: l.type,
      category: l.category,
      price: l.price,
      location: l.location,
      destination: l.destination,
      coordinates: { lat: l.coords[0], lng: l.coords[1] },
      images: [l.image, ...(l.moreImages || [])].map((path) => ({ url: "/images/" + path, publicId: "" })),
      tags: l.tags,
      amenities: l.amenities,
      highlights: l.highlights,
      capacity: l.capacity,
      durationHours: l.hours,
      creator: users[l.creator]._id,
      views: 150 + ((n * 137) % 1800),
    });
    listings.push(listing);
  }

  // ---- reviews (2 or 3 per listing from regular users) ----
  const reviewers = [users.demo, users.rohan, users.meera];
  const templates = data.reviewTemplates;
  for (let i = 0; i < listings.length; i++) {
    const count = 2 + (i % 2); // 2 or 3 reviews (one per reviewer)
    let total = 0;
    for (let r = 0; r < count; r++) {
      const t = templates[(i + r * 3) % templates.length];
      await Review.create({
        user: reviewers[r % reviewers.length]._id,
        listing: listings[i]._id,
        rating: t.rating,
        title: t.title,
        comment: t.comment,
        createdAt: new Date(Date.now() - (i * 3 + r * 11 + 2) * DAY),
      });
      total += t.rating;
    }
    listings[i].reviewCount = count;
    listings[i].rating = Math.round((total / count) * 10) / 10;
    await listings[i].save();
  }

  // ---- bookings spread over the last 6 months so analytics have data ----
  const statuses = ["COMPLETED", "COMPLETED", "CONFIRMED", "CONFIRMED", "PENDING", "CANCELLED"];
  const guestsList = [users.demo, users.rohan, users.meera];
  for (let i = 0; i < 48; i++) {
    const listing = listings[(i * 5) % listings.length];
    const monthsAgo = i % 6;
    const createdAt = new Date(Date.now() - (monthsAgo * 30 + (i % 20)) * DAY);
    const isStay = listing.type === "STAY";
    const nights = isStay ? 1 + (i % 3) : 0;
    const checkIn = new Date(createdAt.getTime() + 10 * DAY);
    checkIn.setUTCHours(0, 0, 0, 0);
    const checkOut = new Date(checkIn.getTime() + nights * DAY);
    const guests = Math.min(1 + (i % 3), listing.capacity);
    let status = statuses[i % statuses.length];
    if (monthsAgo === 0 && status === "COMPLETED") status = "CONFIRMED";
    await Booking.create({
      user: guestsList[i % 3]._id,
      listing: listing._id,
      checkIn,
      checkOut,
      guests,
      totalPrice: isStay ? nights * listing.price : guests * listing.price,
      status,
      bookingReference: generateBookingReference(),
      createdAt,
    });
  }

  // ---- stories ----
  for (let i = 0; i < data.stories.length; i++) {
    const s = data.stories[i];
    await TravelStory.create({
      author: users[s.author]._id,
      title: s.title,
      summary: s.summary,
      content: s.content,
      locations: s.locations,
      images: [{ url: "/images/" + s.image, publicId: "" }],
      likes: [users.demo._id, users.rohan._id, users.meera._id].slice(0, 1 + (i % 3)),
      createdAt: new Date(Date.now() - i * 6 * DAY),
    });
  }

  // ---- favorites for the demo user ----
  const find = (text) => listings.find((l) => l.title.includes(text));
  const saved = ["Pinewood Cabin", "Blue Pottery", "Hidden Waterfall", "Backwater Canoe", "Sunrise Yoga"];
  for (const text of saved) {
    await Favorite.create({ user: users.demo._id, listing: find(text)._id });
  }
  await Favorite.create({ user: users.rohan._id, listing: find("Dzongri")._id });

  // ---- sample trips for the demo user ----
  const kerala = await Trip.create({
    user: users.demo._id,
    name: "Slow Week in Kerala",
    description: "Backwaters, tea gardens and a treehouse. No rushing.",
    destination: "Kerala",
    startDate: daysFromNow(30),
    endDate: daysFromNow(32),
    budget: 40000,
    coverImage: "/images/stays/stay-houseboat-sunset.jpg",
  });
  const keralaPlan = [
    [0, "09:00", "Backwater Canoe", "Bring a hat and a camera"],
    [0, "16:00", "Alleppey Houseboat", "Check in after lunch"],
    [1, "07:00", "Tea Garden Yoga", "Early start"],
    [2, "10:00", "Wayanad Forest Trail", "Wear closed shoes"],
  ];
  for (let i = 0; i < keralaPlan.length; i++) {
    const [dayOffset, time, text, notes] = keralaPlan[i];
    await TripItem.create({ trip: kerala._id, listing: find(text)._id, date: daysFromNow(30 + dayOffset), time, notes, order: i });
  }
  await TripItem.create({ trip: kerala._id, title: "Buy spices at the market", date: daysFromNow(32), time: "11:00", notes: "Pepper and cardamom for home", order: 0 });

  const himachal = await Trip.create({
    user: users.demo._id,
    name: "Himachal Weekend Reset",
    description: "A cabin, a hike and nothing else.",
    destination: "Himachal Pradesh",
    startDate: daysFromNow(60),
    endDate: daysFromNow(61),
    budget: 12000,
    coverImage: "/images/stays/stay-mountain-cabin.jpg",
  });
  await TripItem.create({ trip: himachal._id, listing: find("Pinewood Cabin")._id, date: daysFromNow(60), time: "14:00", notes: "Check-in", order: 0 });
  await TripItem.create({ trip: himachal._id, listing: find("Valley Day Hike")._id, date: daysFromNow(61), time: "08:00", notes: "", order: 0 });

  console.log("Seed finished:");
  console.log(`  ${data.users.length} users, ${listings.length} listings, ${data.stories.length} stories`);
  console.log("  Demo logins (password Password@123): demo@roamroot.com, creator@roamroot.com, admin@roamroot.com");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
