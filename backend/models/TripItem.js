const mongoose = require("mongoose");

const tripItemSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" }, // optional: a note-only item has no listing
  title: { type: String, default: "" }, // used when there is no listing
  date: { type: Date, required: true },
  time: { type: String, default: "" }, // "09:00"
  notes: { type: String, default: "" },
  order: { type: Number, default: 0 },
});

tripItemSchema.index({ trip: 1, date: 1, order: 1 });

module.exports = mongoose.model("TripItem", tripItemSchema);
