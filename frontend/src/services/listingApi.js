import api from "./api";

export const getListings = (params) => api.get("/listings", { params });
export const getListing = (id) => api.get(`/listings/${id}`);
export const getDestinations = () => api.get("/listings/destinations");
export const geocodePlace = (query) => api.get("/listings/geocode", { params: { query } });
export const createListing = (body) => api.post("/listings", body);
export const updateListing = (id, body) => api.put(`/listings/${id}`, body);
export const deleteListing = (id) => api.delete(`/listings/${id}`);

// Images go to Cloudinary through the backend (the secret key never reaches the browser)
export const uploadImages = (files, onProgress) => {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  return api.post("/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => onProgress && event.total && onProgress(Math.round((event.loaded * 100) / event.total)),
    timeout: 120000,
  });
};
