const Joi = require("joi");
const { LISTING_TYPES, CATEGORIES } = require("../utils/constants");

const image = Joi.object({ url: Joi.string().required(), publicId: Joi.string().allow("", null) });

exports.registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.profileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60),
  bio: Joi.string().allow("").max(500),
  location: Joi.string().allow("").max(100),
  avatar: Joi.string().allow(""),
  interests: Joi.array().items(Joi.string()).max(12),
});

exports.forgotSchema = Joi.object({ email: Joi.string().email().required() });

exports.resetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(100).required(),
});

exports.listingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().min(20).max(4000).required(),
  type: Joi.string().valid(...LISTING_TYPES).required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  price: Joi.number().min(0).required(),
  location: Joi.string().trim().required(),
  destination: Joi.string().trim().required(),
  country: Joi.string().default("India"),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  images: Joi.array().items(image).max(10).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  amenities: Joi.array().items(Joi.string()).default([]),
  highlights: Joi.array().items(Joi.string()).default([]),
  capacity: Joi.number().integer().min(1).default(2),
  durationHours: Joi.number().min(0).default(0),
  availability: Joi.object({
    isAvailable: Joi.boolean().default(true),
    availableFrom: Joi.date().allow(null),
    availableTo: Joi.date().allow(null),
  }).default({ isAvailable: true }),
});

exports.reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().allow("").max(100),
  comment: Joi.string().min(3).max(1500).required(),
});

exports.bookingSchema = Joi.object({
  listing: Joi.string().required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date().allow(null),
  guests: Joi.number().integer().min(1).required(),
});

exports.bookingUpdateSchema = Joi.object({
  status: Joi.string().valid("CONFIRMED", "CANCELLED", "COMPLETED").required(),
});

exports.tripSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().allow("").max(500),
  destination: Joi.string().trim().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref("startDate")).required(),
  budget: Joi.number().min(0).default(0),
  coverImage: Joi.string().allow(""),
});

exports.tripItemSchema = Joi.object({
  listing: Joi.string().allow("", null),
  title: Joi.string().allow("").max(120),
  date: Joi.date().required(),
  time: Joi.string().allow("").max(10),
  notes: Joi.string().allow("").max(500),
  order: Joi.number().integer().min(0),
});

exports.storySchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required(),
  summary: Joi.string().allow("").max(300),
  content: Joi.string().min(50).required(),
  images: Joi.array().items(image).max(6).default([]),
  locations: Joi.array().items(Joi.string()).default([]),
});

exports.planTripSchema = Joi.object({
  destination: Joi.string().trim().required(),
  days: Joi.number().integer().min(1).max(14).required(),
  budget: Joi.number().min(0).default(0),
  party: Joi.string().allow("").default("Solo"),
  interests: Joi.array().items(Joi.string()).default([]),
  style: Joi.string().allow("").default(""),
  pace: Joi.string().valid("Relaxed", "Balanced", "Packed").default("Balanced"),
});

exports.chatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(500).required(),
  // what the user is looking at right now (optional)
  context: Joi.object({
    destination: Joi.string().allow(""),
    listingId: Joi.string().allow(""),
  }).default({}),
});

exports.recommendSchema = Joi.object({
  destination: Joi.string().allow(""),
  interests: Joi.array().items(Joi.string()).default([]),
  maxPrice: Joi.number().min(0),
  category: Joi.string().allow(""),
  limit: Joi.number().integer().min(1).max(20).default(8),
});
