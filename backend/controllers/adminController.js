const User = require("../models/User");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const TravelStory = require("../models/TravelStory");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { ROLES } = require("../utils/constants");

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select("name email role createdAt");
  const [listings, reviews, stories] = await Promise.all([
    Listing.countDocuments(),
    Review.countDocuments(),
    TravelStory.countDocuments(),
  ]);
  sendSuccess(res, { users, counts: { users: users.length, listings, reviews, stories } });
});

exports.changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role");
  if (req.params.id === String(req.user._id)) throw new ApiError(400, "You cannot change your own role");
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  sendSuccess(res, { user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw new ApiError(400, "You cannot delete yourself");
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  sendSuccess(res, { message: "User deleted" });
});
