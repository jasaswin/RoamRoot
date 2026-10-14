import api from "./api";

export const getReviews = (listingId, params) => api.get(`/listings/${listingId}/reviews`, { params });
export const createReview = (listingId, body) => api.post(`/listings/${listingId}/reviews`, body);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
