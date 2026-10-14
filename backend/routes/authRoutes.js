const router = require("express").Router();
const auth = require("../controllers/authController");
const { protect, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const v = require("../middleware/validators");

router.post("/register", validate(v.registerSchema), auth.register);
router.post("/login", validate(v.loginSchema), auth.login);
router.post("/logout", auth.logout);
router.get("/me", optionalAuth, auth.me); // guests get { user: null } instead of an error
router.put("/profile", protect, validate(v.profileSchema), auth.updateProfile);
router.get("/stats", protect, auth.profileStats);
router.post("/become-creator", protect, auth.becomeCreator);
router.post("/forgot-password", validate(v.forgotSchema), auth.forgotPassword);
router.post("/reset-password", validate(v.resetSchema), auth.resetPassword);

module.exports = router;
