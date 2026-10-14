const ApiError = require("../utils/ApiError");

// Usage: router.post("/", protect, allowRoles("CREATOR", "ADMIN"), handler)
exports.allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to do this"));
  }
  next();
};
