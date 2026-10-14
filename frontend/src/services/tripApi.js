import api from "./api";

export const getTrips = () => api.get("/trips");
export const getTrip = (id) => api.get(`/trips/${id}`);
export const createTrip = (body) => api.post("/trips", body);
export const updateTrip = (id, body) => api.put(`/trips/${id}`, body);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);
export const createTripFromPlan = (body) => api.post("/trips/from-plan", body);
export const addTripItem = (tripId, body) => api.post(`/trips/${tripId}/items`, body);
export const updateTripItem = (tripId, itemId, body) => api.put(`/trips/${tripId}/items/${itemId}`, body);
export const deleteTripItem = (tripId, itemId) => api.delete(`/trips/${tripId}/items/${itemId}`);
