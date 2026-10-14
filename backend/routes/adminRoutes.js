const router = require("express").Router();
const admin = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/roles");

router.use(protect, allowRoles("ADMIN"));
router.get("/users", admin.getUsers);
router.patch("/users/:id/role", admin.changeRole);
router.delete("/users/:id", admin.deleteUser);

module.exports = router;
