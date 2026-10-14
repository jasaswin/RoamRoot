const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Favorite = require("../models/Favorite");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");
const TravelStory = require("../models/TravelStory");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function sendToken(res, user, statusCode = 200) {
  const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });
  sendSuccess(res, { user: publicUser(user) }, statusCode);
}

// Never send the password hash to the frontend
function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    role: user.role,
    interests: user.interests,
    createdAt: user.createdAt,
  };
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  sendToken(res, user, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk) throw new ApiError(401, "Wrong email or password");
  sendToken(res, user);
});

exports.logout = (req, res) => {
  res.clearCookie("token");
  sendSuccess(res, { message: "Logged out" });
};

exports.me = (req, res) => {
  sendSuccess(res, { user: req.user ? publicUser(req.user) : null });
};

exports.updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  sendSuccess(res, { user: publicUser(req.user) });
});

exports.becomeCreator = asyncHandler(async (req, res) => {
  if (req.user.role === "USER") {
    req.user.role = "CREATOR";
    await req.user.save();
  }
  sendSuccess(res, { user: publicUser(req.user) });
});

// Numbers shown on the profile page
exports.profileStats = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const [saved, trips, bookings, stories] = await Promise.all([
    Favorite.countDocuments({ user: id }),
    Trip.countDocuments({ user: id }),
    Booking.countDocuments({ user: id }),
    TravelStory.countDocuments({ author: id }),
  ]);
  sendSuccess(res, { saved, trips, bookings, stories });
});

// Password reset. There is no email service in this project, so in development
// the reset link is printed in the server console instead of being emailed.
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;
    console.log("Password reset link (no email service configured):", link);
  }
  // Same answer whether or not the email exists
  sendSuccess(res, { message: "If that email exists, a reset link has been created." });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: Date.now() },
  }).select("+resetTokenHash +resetTokenExpires");
  if (!user) throw new ApiError(400, "This reset link is invalid or has expired");

  user.passwordHash = await bcrypt.hash(req.body.password, 10);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  sendSuccess(res, { message: "Password updated. You can log in now." });
});
