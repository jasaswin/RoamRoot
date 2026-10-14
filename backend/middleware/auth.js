const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// Reads the JWT from the http-only cookie and loads the user from the database.
// The role always comes from the database, never from the frontend.
async function loadUser(req) {
  const token = req.cookies.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    return await User.findById(decoded.id);
  } catch (err) {
    return null;
  }
}

exports.protect = asyncHandler(async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) throw new ApiError(401, "Please log in to continue");
  req.user = user;
  next();
});

// For public routes that behave a little differently for logged-in users
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await loadUser(req);
  next();
});
