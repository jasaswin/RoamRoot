import api from "./api";

export const planTrip = (body) => api.post("/ai/plan-trip", body);
export const recommend = (body) => api.post("/ai/recommend", body);
export const chat = (body) => api.post("/ai/chat", body);
