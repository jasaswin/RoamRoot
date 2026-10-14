const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { planTrip } = require("../services/ai/travelPlanner");
const { getRecommendations } = require("../services/ai/recommendationService");
const { chat } = require("../services/ai/experienceAssistant");

exports.planTrip = asyncHandler(async (req, res) => {
  const plan = await planTrip(req.body, req.user);
  sendSuccess(res, { plan });
});

exports.recommend = asyncHandler(async (req, res) => {
  const results = await getRecommendations({ ...req.body, user: req.user });
  sendSuccess(res, {
    recommendations: results.map((r) => ({ listing: r.listing, reasons: r.reasons.slice(0, 2) })),
  });
});

exports.chat = asyncHandler(async (req, res) => {
  const answer = await chat({ message: req.body.message, user: req.user, context: req.body.context });
  sendSuccess(res, answer);
});
