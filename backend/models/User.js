const mongoose = require("mongoose");
const { ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  role: { type: String, enum: ROLES, default: "USER" },
  interests: [String],
  resetTokenHash: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
