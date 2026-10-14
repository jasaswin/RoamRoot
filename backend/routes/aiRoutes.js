const router = require("express").Router();
const ai = require("../controllers/aiController");
const { optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../middleware/validators");

router.use(optionalAuth);
router.post("/plan-trip", validate(v.planTripSchema), ai.planTrip);
router.post("/recommend", validate(v.recommendSchema), ai.recommend);
router.post("/chat", validate(v.chatSchema), ai.chat);

module.exports = router;
