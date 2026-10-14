const TravelStory = require("../models/TravelStory");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, getPagination, paginated } = require("../utils/apiResponse");
const { deleteImages } = require("../services/cloudinaryService");

exports.getStories = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 9);
  const filter = req.query.author ? { author: req.query.author } : {};
  const [items, total] = await Promise.all([
    TravelStory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("author", "name avatar"),
    TravelStory.countDocuments(filter),
  ]);
  sendSuccess(res, paginated(items, total, page, limit));
});

exports.getStory = asyncHandler(async (req, res) => {
  const story = await TravelStory.findById(req.params.id).populate("author", "name avatar bio");
  if (!story) throw new ApiError(404, "Story not found");
  const more = await TravelStory.find({ _id: { $ne: story._id } }).sort({ createdAt: -1 }).limit(3).populate("author", "name avatar");
  sendSuccess(res, { story, more });
});

exports.createStory = asyncHandler(async (req, res) => {
  const story = await TravelStory.create({ ...req.body, author: req.user._id });
  sendSuccess(res, { story }, 201);
});

async function findMyStory(req) {
  const story = await TravelStory.findById(req.params.id);
  if (!story) throw new ApiError(404, "Story not found");
  if (!story.author.equals(req.user._id) && req.user.role !== "ADMIN") {
    throw new ApiError(403, "You can only change your own stories");
  }
  return story;
}

exports.updateStory = asyncHandler(async (req, res) => {
  const story = await findMyStory(req);
  Object.assign(story, req.body);
  await story.save();
  sendSuccess(res, { story });
});

exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await findMyStory(req);
  await deleteImages(story.images);
  await story.deleteOne();
  sendSuccess(res, { message: "Story deleted" });
});

// Like / unlike
exports.toggleLike = asyncHandler(async (req, res) => {
  const story = await TravelStory.findById(req.params.id);
  if (!story) throw new ApiError(404, "Story not found");
  const index = story.likes.findIndex((id) => id.equals(req.user._id));
  if (index === -1) story.likes.push(req.user._id);
  else story.likes.splice(index, 1);
  await story.save();
  sendSuccess(res, { likes: story.likes.length, liked: index === -1 });
});
