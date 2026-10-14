const mongoose = require("mongoose");

// The items of a trip live in the TripItem collection (Trip -> many TripItems)
const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
  },
  { timestamps: true }
);

tripSchema.index({ user: 1, startDate: -1 });

module.exports = mongoose.model("Trip", tripSchema);
