const mongoose = require("mongoose");
const { BOOKING_STATUSES } = require("../utils/constants");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: BOOKING_STATUSES, default: "PENDING" },
  bookingReference: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ listing: 1, checkIn: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
