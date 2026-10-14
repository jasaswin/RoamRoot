import api from "./api";

export const getStories = (params) => api.get("/stories", { params });
export const getStory = (id) => api.get(`/stories/${id}`);
export const createStory = (body) => api.post("/stories", body);
export const deleteStory = (id) => api.delete(`/stories/${id}`);
export const likeStory = (id) => api.post(`/stories/${id}/like`);
