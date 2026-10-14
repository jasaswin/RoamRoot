const router = require("express").Router();
const creator = require("../controllers/creatorController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

// public
router.get("/featured", creator.getFeaturedCreators);

// creator only
router.get("/dashboard", protect, allowRoles("CREATOR", "ADMIN"), creator.getDashboard);
router.get("/listings", protect, allowRoles("CREATOR", "ADMIN"), creator.getMyListings);
router.get("/bookings", protect, allowRoles("CREATOR", "ADMIN"), creator.getMyBookings);
router.get("/analytics", protect, allowRoles("CREATOR", "ADMIN"), creator.getAnalytics);

// public profile (kept last so it does not catch the routes above)
router.get("/profile/:id", creator.getCreatorProfile);

module.exports = router;
