// One place that turns every error into the same JSON shape
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "That item already exists";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 5 MB)" : err.message;
  }

  if (statusCode === 500) {
    console.error("Server error:", err.message);
    if (process.env.NODE_ENV === "production") message = "Something went wrong";
  }

  res.status(statusCode).json({ success: false, message });
};
