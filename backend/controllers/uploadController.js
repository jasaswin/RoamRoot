const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { uploadImage } = require("../services/cloudinaryService");

exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new ApiError(400, "Please choose at least one image");
  const images = [];
  for (const file of req.files) {
    images.push(await uploadImage(file));
  }
  sendSuccess(res, { images }, 201);
});
