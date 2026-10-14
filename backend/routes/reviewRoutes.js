const router = require("express").Router();
const reviews = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.delete("/:id", protect, reviews.deleteReview);

module.exports = router;
