import axios from "axios";
import { API_BASE, ENDPOINTS, apiUrl } from "./endpoints";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refresh = localStorage.getItem("refresh");

    if (
      error.response &&
      error.response.status === 401 &&
      refresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(apiUrl(ENDPOINTS.AUTH_REFRESH), {
          refresh,
        });

        localStorage.setItem("access", res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
