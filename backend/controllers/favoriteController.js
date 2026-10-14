const Favorite = require("../models/Favorite");
const Listing = require("../models/Listing");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

exports.getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 }).populate({
    path: "listing",
    populate: { path: "creator", select: "name avatar" },
  });
  // skip favorites whose listing was deleted
  const listings = favorites.filter((f) => f.listing).map((f) => f.listing);
  sendSuccess(res, { listings });
});

exports.addFavorite = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.listingId);
  if (!listing) throw new ApiError(404, "Listing not found");
  await Favorite.updateOne(
    { user: req.user._id, listing: listing._id },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  sendSuccess(res, { saved: true }, 201);
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ user: req.user._id, listing: req.params.listingId });
  sendSuccess(res, { saved: false });
});
