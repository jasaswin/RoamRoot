const router = require("express").Router();
const trips = require("../controllers/tripController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../middleware/validators");

router.use(protect);
router.get("/", trips.getTrips);
router.post("/", validate(v.tripSchema), trips.createTrip);
router.post("/from-plan", trips.createFromPlan); // must be above /:id routes
router.get("/:id", trips.getTrip);
router.put("/:id", validate(v.tripSchema), trips.updateTrip);
router.delete("/:id", trips.deleteTrip);

router.post("/:id/items", validate(v.tripItemSchema), trips.addItem);
router.put("/:id/items/:itemId", validate(v.tripItemSchema.fork(["date"], (s) => s.optional())), trips.updateItem);
router.delete("/:id/items/:itemId", trips.deleteItem);

module.exports = router;
