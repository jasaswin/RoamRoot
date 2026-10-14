const multer = require("multer");
const ApiError = require("../utils/ApiError");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

// Files stay in memory and are sent straight to Cloudinary
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5 MB each, 8 files max
  fileFilter: (req, file, cb) => {
    const ok = ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.test(file.originalname);
    if (!ok) return cb(new ApiError(400, "Only JPG, PNG or WEBP images are allowed"));
    cb(null, true);
  },
});
