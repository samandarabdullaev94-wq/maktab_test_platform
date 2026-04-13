const DEFAULT_API_BASE = "http://127.0.0.1:8000/api/";

export const API_BASE = (
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE
).replace(/\/?$/, "/");

export const ENDPOINTS = {
  AUTH_REFRESH: "refresh/",
};

export function apiUrl(path = "") {
  return `${API_BASE}${String(path).replace(/^\/+/, "")}`;
}
