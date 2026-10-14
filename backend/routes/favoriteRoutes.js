const router = require("express").Router();
const favorites = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", favorites.getFavorites);
router.post("/:listingId", favorites.addFavorite);
router.delete("/:listingId", favorites.removeFavorite);

module.exports = router;
