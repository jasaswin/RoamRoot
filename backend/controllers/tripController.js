const Trip = require("../models/Trip");
const TripItem = require("../models/TripItem");
const Listing = require("../models/Listing");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// A user can only touch their own trips
async function findMyTrip(req) {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, "Trip not found");
  if (!trip.user.equals(req.user._id) && req.user.role !== "ADMIN") {
    throw new ApiError(403, "This is not your trip");
  }
  return trip;
}

exports.getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user._id }).sort({ startDate: -1 });
  const withCounts = [];
  for (const trip of trips) {
    const itemCount = await TripItem.countDocuments({ trip: trip._id });
    withCounts.push({ ...trip.toObject(), itemCount });
  }
  sendSuccess(res, { trips: withCounts });
});

exports.createTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.create({ ...req.body, user: req.user._id });
  sendSuccess(res, { trip }, 201);
});

exports.getTrip = asyncHandler(async (req, res) => {
  const trip = await findMyTrip(req);
  const items = await TripItem.find({ trip: trip._id })
    .sort({ date: 1, order: 1 })
    .populate("listing", "title images location type price coordinates destination rating");
  sendSuccess(res, { trip, items });
});

exports.updateTrip = asyncHandler(async (req, res) => {
  const trip = await findMyTrip(req);
  Object.assign(trip, req.body);
  await trip.save();
  sendSuccess(res, { trip });
});

exports.deleteTrip = asyncHandler(async (req, res) => {
  const trip = await findMyTrip(req);
  await TripItem.deleteMany({ trip: trip._id });
  await trip.deleteOne();
  sendSuccess(res, { message: "Trip deleted" });
});

exports.addItem = asyncHandler(async (req, res) => {
  const trip = await findMyTrip(req);
  if (req.body.listing) {
    const exists = await Listing.exists({ _id: req.body.listing });
    if (!exists) throw new ApiError(404, "Listing not found");
  } else if (!req.body.title) {
    throw new ApiError(400, "Choose a listing or write a title for this item");
  }
  const sameDay = await TripItem.countDocuments({ trip: trip._id, date: req.body.date });
  const item = await TripItem.create({
    ...req.body,
    listing: req.body.listing || undefined,
    trip: trip._id,
    order: req.body.order ?? sameDay,
  });
  await item.populate("listing", "title images location type price coordinates destination rating");
  sendSuccess(res, { item }, 201);
});

exports.updateItem = asyncHandler(async (req, res) => {
  const trip = await findMyTrip(req);
  const item = await TripItem.findOne({ _id: req.params.itemId, trip: trip._id });
  if (!item) throw new ApiError(404, "Trip item not found");
  const { date, time, notes, order, title } = req.body;
  if (date !== undefined) item.date = date;
  if (time !== undefined) item.time = time;
  if (notes !== undefined) item.notes = notes;
  if (title !== undefined) item.title = title;
  if (order !== undefined) item.order = order;
  await item.save();
  sendSuccess(res, { item });
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const trip = await findMyTrip(req);
  await TripItem.deleteOne({ _id: req.params.itemId, trip: trip._id });
  sendSuccess(res, { message: "Item removed" });
});

// Used by the AI planner: creates a trip and all its items in one request
exports.createFromPlan = asyncHandler(async (req, res) => {
  const { name, destination, startDate, days, budget, description } = req.body;
  if (!name || !destination || !startDate || !Array.isArray(days) || days.length === 0) {
    throw new ApiError(400, "name, destination, startDate and days are required");
  }
  const start = new Date(startDate);
  const end = new Date(start.getTime() + (days.length - 1) * 24 * 60 * 60 * 1000);

  const firstListing = days.flatMap((d) => d.items || []).find((i) => i.listingId);
  const listing = firstListing ? await Listing.findById(firstListing.listingId) : null;

  const trip = await Trip.create({
    user: req.user._id,
    name,
    destination,
    description: description || "",
    startDate: start,
    endDate: end,
    budget: budget || 0,
    coverImage: listing && listing.images[0] ? listing.images[0].url : "",
  });

  for (let i = 0; i < days.length; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const items = days[i].items || [];
    for (let j = 0; j < items.length; j++) {
      const exists = items[j].listingId ? await Listing.exists({ _id: items[j].listingId }) : null;
      await TripItem.create({
        trip: trip._id,
        listing: exists ? items[j].listingId : undefined,
        title: exists ? "" : items[j].title || "Free time",
        date,
        time: items[j].time || "",
        notes: items[j].notes || "",
        order: j,
      });
    }
  }
  sendSuccess(res, { trip }, 201);
});
