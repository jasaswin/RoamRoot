import api from "./api";

export const getUsers = () => api.get("/admin/users");
export const changeRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
