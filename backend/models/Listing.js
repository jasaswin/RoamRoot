const mongoose = require("mongoose");
const { LISTING_TYPES, CATEGORIES } = require("../utils/constants");

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: LISTING_TYPES, required: true },
    images: [{ url: String, publicId: String }],
    price: { type: Number, required: true, min: 0 }, // INR. Per night for stays, per person for the rest
    location: { type: String, required: true }, // e.g. "Palolem, Goa"
    destination: { type: String, required: true }, // e.g. "Goa" (used by filters and the AI planner)
    country: { type: String, default: "India" },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    category: { type: String, enum: CATEGORIES, required: true },
    tags: [String],
    amenities: [String],
    highlights: [String],
    capacity: { type: Number, default: 2, min: 1 },
    durationHours: { type: Number, default: 0 }, // 0 for stays
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    availability: {
      isAvailable: { type: Boolean, default: true },
      availableFrom: Date,
      availableTo: Date,
    },
  },
  { timestamps: true }
);

listingSchema.index({ type: 1, category: 1 });
listingSchema.index({ destination: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ rating: -1 });
listingSchema.index({ creator: 1 });
listingSchema.index({ tags: 1 });

module.exports = mongoose.model("Listing", listingSchema);
