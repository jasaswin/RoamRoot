const cloudinary = require("../config/cloudinary");

// Uploads one image buffer (from multer) to Cloudinary
exports.uploadImage = (file, folder = "roamroot") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

// Only deletes images that RoamRoot uploaded (seed photos have no publicId)
exports.deleteImages = async (images = []) => {
  for (const img of images) {
    if (img.publicId && img.publicId.startsWith("roamroot/")) {
      try {
        await cloudinary.uploader.destroy(img.publicId);
      } catch (err) {
        console.error("Could not delete image from Cloudinary");
      }
    }
  }
};
