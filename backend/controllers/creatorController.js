const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const TravelStory = require("../models/TravelStory");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// Last 6 months as { key: "2026-10", label: "Oct" }
function lastSixMonths() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      bookings: 0,
      revenue: 0,
    });
  }
  return months;
}

// All the numbers for the dashboard and analytics pages
async function buildAnalytics(creatorId) {
  const listings = await Listing.find({ creator: creatorId });
  const listingIds = listings.map((l) => l._id);
  const bookings = await Booking.find({ listing: { $in: listingIds }, status: { $ne: "CANCELLED" } });

  // only confirmed and completed bookings count as revenue
  const earns = (b) => b.status === "CONFIRMED" || b.status === "COMPLETED";

  const months = lastSixMonths();
  for (const b of bookings) {
    const month = months.find((m) => m.key === b.createdAt.toISOString().slice(0, 7));
    if (month) {
      month.bookings += 1;
      if (earns(b)) month.revenue += b.totalPrice;
    }
  }

  const performance = listings.map((l) => {
    const mine = bookings.filter((b) => b.listing.equals(l._id));
    return {
      _id: l._id,
      title: l.title,
      type: l.type,
      views: l.views,
      rating: l.rating,
      bookings: mine.length,
      revenue: mine.filter(earns).reduce((sum, b) => sum + b.totalPrice, 0),
    };
  });

  const rated = listings.filter((l) => l.reviewCount > 0);
  const averageRating = rated.length ? rated.reduce((sum, l) => sum + l.rating, 0) / rated.length : 0;

  return {
    totals: {
      listings: listings.length,
      bookings: bookings.length,
      revenue: bookings.filter(earns).reduce((sum, b) => sum + b.totalPrice, 0),
      averageRating: Math.round(averageRating * 10) / 10,
      views: listings.reduce((sum, l) => sum + l.views, 0),
    },
    monthly: months,
    performance,
    topExperiences: [...performance].sort((a, b) => b.bookings - a.bookings).slice(0, 5),
  };
}

exports.getAnalytics = asyncHandler(async (req, res) => {
  sendSuccess(res, await buildAnalytics(req.user._id));
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const analytics = await buildAnalytics(req.user._id);
  const listingIds = analytics.performance.map((l) => l._id);
  const recentBookings = await Booking.find({ listing: { $in: listingIds } })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name")
    .populate("listing", "title");
  sendSuccess(res, { ...analytics, recentBookings });
});

exports.getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ creator: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { listings });
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ creator: req.user._id }).select("_id");
  const bookings = await Booking.find({ listing: { $in: listings.map((l) => l._id) } })
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("listing", "title type images");
  sendSuccess(res, { bookings });
});

// Public creator page: /creators/:id
exports.getCreatorProfile = asyncHandler(async (req, res) => {
  const creator = await User.findById(req.params.id).select("name avatar bio location role createdAt");
  if (!creator || creator.role === "USER") throw new ApiError(404, "Creator not found");

  const listings = await Listing.find({ creator: creator._id }).sort({ rating: -1 });
  const stories = await TravelStory.find({ author: creator._id }).sort({ createdAt: -1 }).limit(6);
  const reviews = await Review.find({ listing: { $in: listings.map((l) => l._id) } })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate("user", "name avatar")
    .populate("listing", "title");

  const rated = listings.filter((l) => l.reviewCount > 0);
  const rating = rated.length ? rated.reduce((sum, l) => sum + l.rating, 0) / rated.length : 0;
  const reviewCount = listings.reduce((sum, l) => sum + l.reviewCount, 0);

  sendSuccess(res, {
    creator,
    listings,
    stories,
    reviews,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
  });
});

// Home page "Creator spotlight"
exports.getFeaturedCreators = asyncHandler(async (req, res) => {
  const creators = await User.find({ role: "CREATOR" }).select("name avatar bio location").limit(4);
  const result = [];
  for (const c of creators) {
    const count = await Listing.countDocuments({ creator: c._id });
    result.push({ ...c.toObject(), listingCount: count });
  }
  sendSuccess(res, { creators: result });
});
