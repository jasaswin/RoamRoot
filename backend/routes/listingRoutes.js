const router = require("express").Router();
const listings = require("../controllers/listingController");
const reviews = require("../controllers/reviewController");
const { protect, optionalAuth } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");
const validate = require("../middleware/validate");
const v = require("../middleware/validators");

router.get("/", listings.getListings);
router.get("/destinations", listings.getDestinations);
router.get("/geocode", protect, allowRoles("CREATOR", "ADMIN"), listings.geocodeLocation); // above /:id
router.post("/", protect, allowRoles("CREATOR", "ADMIN"), validate(v.listingSchema), listings.createListing);
router.get("/:id", optionalAuth, listings.getListing);
router.put("/:id", protect, allowRoles("CREATOR", "ADMIN"), validate(v.listingSchema), listings.updateListing);
router.delete("/:id", protect, allowRoles("CREATOR", "ADMIN"), listings.deleteListing);

// reviews of one listing
router.get("/:id/reviews", reviews.getReviews);
router.post("/:id/reviews", protect, validate(v.reviewSchema), reviews.createReview);

module.exports = router;
