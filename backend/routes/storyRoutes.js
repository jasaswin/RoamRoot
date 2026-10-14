const router = require("express").Router();
const stories = require("../controllers/storyController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../middleware/validators");

router.get("/", stories.getStories);
router.get("/:id", stories.getStory);
router.post("/", protect, validate(v.storySchema), stories.createStory);
router.put("/:id", protect, validate(v.storySchema), stories.updateStory);
router.delete("/:id", protect, stories.deleteStory);
router.post("/:id/like", protect, stories.toggleLike);

module.exports = router;
