const Review = require("../models/Review");
const Listing = require("../models/Listing");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, getPagination, paginated } = require("../utils/apiResponse");

// Recalculates the average rating of a listing after a review is added or deleted
async function updateListingRating(listingId) {
  const reviews = await Review.find({ listing: listingId }).select("rating");
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = reviews.length ? Math.round((total / reviews.length) * 10) / 10 : 0;
  await Listing.updateOne({ _id: listingId }, { rating: average, reviewCount: reviews.length });
}

exports.getReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = { listing: req.params.id };
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name avatar"),
    Review.countDocuments(filter),
  ]);
  sendSuccess(res, paginated(items, total, page, limit));
});

exports.createReview = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, "Listing not found");
  if (listing.creator.equals(req.user._id)) {
    throw new ApiError(400, "You cannot review your own listing");
  }
  const already = await Review.findOne({ user: req.user._id, listing: listing._id });
  if (already) throw new ApiError(409, "You have already reviewed this listing");

  const review = await Review.create({ ...req.body, user: req.user._id, listing: listing._id });
  await updateListingRating(listing._id);
  await review.populate("user", "name avatar");
  sendSuccess(res, { review }, 201);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  const isAuthor = review.user.equals(req.user._id);
  if (!isAuthor && req.user.role !== "ADMIN") {
    throw new ApiError(403, "You can only delete your own reviews");
  }
  await review.deleteOne();
  await updateListingRating(review.listing);
  sendSuccess(res, { message: "Review deleted" });
});
