import api from "./api";

export const getDashboard = () => api.get("/creator/dashboard");
export const getCreatorListings = () => api.get("/creator/listings");
export const getCreatorBookings = () => api.get("/creator/bookings");
export const getAnalytics = () => api.get("/creator/analytics");
export const getCreatorProfile = (id) => api.get(`/creator/profile/${id}`);
export const getFeaturedCreators = () => api.get("/creator/featured");
