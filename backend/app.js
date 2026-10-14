const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Basic protection against too many requests
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { success: false, message: "Too many attempts, please try again later" } });
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

app.get("/api/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/listings", require("./routes/listingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/creator", require("./routes/creatorRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
