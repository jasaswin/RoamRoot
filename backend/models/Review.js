const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: "" },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// one review per user per listing
reviewSchema.index({ user: 1, listing: 1 }, { unique: true });
reviewSchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
