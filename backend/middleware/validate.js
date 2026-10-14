const ApiError = require("../utils/ApiError");

// Usage: router.post("/", validate(someJoiSchema), handler)
// Replaces req.body with the cleaned data (unknown fields are removed).
module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message.replace(/"/g, "")).join(", ");
    return next(new ApiError(400, message));
  }
  req.body = value;
  next();
};
