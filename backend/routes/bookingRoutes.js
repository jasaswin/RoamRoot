const router = require("express").Router();
const bookings = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../middleware/validators");

router.use(protect);
router.post("/", validate(v.bookingSchema), bookings.createBooking);
router.get("/", bookings.getMyBookings);
router.get("/:id", bookings.getBooking);
router.patch("/:id", validate(v.bookingUpdateSchema), bookings.updateBooking);
router.delete("/:id", bookings.deleteBooking);

module.exports = router;
