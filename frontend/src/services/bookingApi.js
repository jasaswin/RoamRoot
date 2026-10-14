import api from "./api";

export const createBooking = (body) => api.post("/bookings", body);
export const getBookings = () => api.get("/bookings");
export const updateBooking = (id, status) => api.patch(`/bookings/${id}`, { status });
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);
