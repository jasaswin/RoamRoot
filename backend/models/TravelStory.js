const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, default: "" },
  content: { type: String, required: true },
  images: [{ url: String, publicId: String }],
  locations: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

storySchema.index({ createdAt: -1 });

module.exports = mongoose.model("TravelStory", storySchema);
