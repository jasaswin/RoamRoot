const mongoose = require("mongoose");

// Uses the existing ATLASDB_URL. RoamRoot stores its data in its own database name
// (DB_NAME, default "roamroot") so the old collections are never touched.
async function connectDB() {
  if (!process.env.ATLASDB_URL) {
    throw new Error("ATLASDB_URL is missing in backend/.env");
  }
  await mongoose.connect(process.env.ATLASDB_URL, {
    dbName: process.env.DB_NAME || "roamroot",
  });
  console.log("MongoDB connected");
}

module.exports = connectDB;
