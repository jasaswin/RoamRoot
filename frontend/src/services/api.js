import axios from "axios";

// One Axios client for the whole app. The login cookie is sent automatically.
const api = axios.create({ baseURL: "/api", withCredentials: true, timeout: 20000 });

// Every backend answer looks like { success, data }. We return just the data.
api.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    let message;
    if (error.response) message = error.response.data?.message || "Something went wrong";
    else if (error.code === "ECONNABORTED") message = "The server took too long to answer. Please try again.";
    else message = "Can't reach RoamRoot right now. Check your internet connection.";
    const err = new Error(message);
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default api;
