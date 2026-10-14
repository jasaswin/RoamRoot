const Listing = require("../models/Listing");
const Review = require("../models/Review");
const Favorite = require("../models/Favorite");
const Booking = require("../models/Booking");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, getPagination, paginated } = require("../utils/apiResponse");
const { deleteImages } = require("../services/cloudinaryService");
const { geocode } = require("../services/geocodingService");

// Makes a safe regular expression out of whatever the user typed
function safeRegex(text) {
  return new RegExp(String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

// Builds the MongoDB filter from the query string, e.g. ?type=EXPERIENCE&maxPrice=3000
function buildFilter(query) {
  const filter = { "availability.isAvailable": { $ne: false } };

  // $and lets us combine the keyword search and the destination filter
  const conditions = [];
  if (query.q) {
    const regex = safeRegex(query.q);
    conditions.push({ $or: [{ title: regex }, { description: regex }, { location: regex }, { destination: regex }, { tags: regex }] });
  }
  if (query.destination) {
    const regex = safeRegex(query.destination);
    conditions.push({ $or: [{ destination: regex }, { location: regex }] }); // "Mysore" also matches "Mysore, Karnataka"
  }
  if (conditions.length) filter.$and = conditions;
  if (query.type) filter.type = { $in: String(query.type).split(",") };
  if (query.category) filter.category = { $in: String(query.category).split(",") };
  if (query.tag) filter.tags = { $in: String(query.tag).split(",").map((t) => t.toLowerCase()) };
  if (query.creator) filter.creator = query.creator;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.minRating) filter.rating = { $gte: Number(query.minRating) };
  if (query.maxDuration) filter.durationHours = { $lte: Number(query.maxDuration) };

  return filter;
}

const SORT_OPTIONS = {
  popular: { views: -1 },
  rating: { rating: -1, reviewCount: -1 },
  priceLow: { price: 1 },
  priceHigh: { price: -1 },
  newest: { createdAt: -1 },
};

exports.getListings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildFilter(req.query);
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.popular;

  const [items, total] = await Promise.all([
    Listing.find(filter).sort(sort).skip(skip).limit(limit).populate("creator", "name avatar"),
    Listing.countDocuments(filter),
  ]);
  sendSuccess(res, paginated(items, total, page, limit));
});

exports.getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("creator", "name avatar bio location");
  if (!listing) throw new ApiError(404, "Listing not found");

  // count a view (not for the creator looking at their own listing)
  const isOwner = req.user && listing.creator._id.equals(req.user._id);
  if (!isOwner) {
    await Listing.updateOne({ _id: listing._id }, { $inc: { views: 1 } });
  }

  const related = await Listing.find({
    _id: { $ne: listing._id },
    $or: [{ destination: listing.destination }, { category: listing.category }],
  })
    .sort({ rating: -1 })
    .limit(4);

  sendSuccess(res, { listing, related });
});

exports.createListing = asyncHandler(async (req, res) => {
  const listing = await Listing.create({ ...req.body, creator: req.user._id });
  sendSuccess(res, { listing }, 201);
});

// Creators can only change their own listings. Admins can change any.
async function findOwnedListing(req) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, "Listing not found");
  const isOwner = listing.creator.equals(req.user._id);
  if (!isOwner && req.user.role !== "ADMIN") {
    throw new ApiError(403, "You can only change your own listings");
  }
  return listing;
}

exports.updateListing = asyncHandler(async (req, res) => {
  const listing = await findOwnedListing(req);

  // delete Cloudinary images that were removed in the form
  const keptIds = req.body.images.map((img) => img.publicId);
  await deleteImages(listing.images.filter((img) => !keptIds.includes(img.publicId)));

  Object.assign(listing, req.body);
  await listing.save();
  sendSuccess(res, { listing });
});

exports.deleteListing = asyncHandler(async (req, res) => {
  const listing = await findOwnedListing(req);
  await deleteImages(listing.images);
  await Review.deleteMany({ listing: listing._id });
  await Favorite.deleteMany({ listing: listing._id });
  await Booking.deleteMany({ listing: listing._id });
  await listing.deleteOne();
  sendSuccess(res, { message: "Listing deleted" });
});

// Destinations that exist in the database (used by search suggestions)
exports.getDestinations = asyncHandler(async (req, res) => {
  const destinations = await Listing.aggregate([
    { $group: { _id: "$destination", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  sendSuccess(res, { destinations: destinations.map((d) => ({ name: d._id, count: d.count })) });
});

// Finds coordinates for a place name (used by the listing form's "Find on map" button)
exports.geocodeLocation = asyncHandler(async (req, res) => {
  const query = String(req.query.query || "").trim();
  if (query.length < 3) throw new ApiError(400, "Type a place name first");
  let result = null;
  try {
    result = await geocode(query);
  } catch (err) {
    throw new ApiError(502, "The map search is not reachable right now. Enter the coordinates by hand.");
  }
  if (!result) throw new ApiError(404, "We couldn't find that place. Try adding the state, or enter the coordinates by hand.");
  sendSuccess(res, result);
});
