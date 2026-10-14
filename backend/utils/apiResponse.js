exports.sendSuccess = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

// Used by every list endpoint
exports.getPagination = (query, defaultLimit = 12) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || defaultLimit, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

exports.paginated = (items, total, page, limit) => ({
  items,
  pagination: { page, limit, total, pages: Math.ceil(total / limit) },
});
