const API_BASE_URL = "http://127.0.0.1:8000/api";

export default API_BASE_URL;
export { API_BASE_URL };
export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("access");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
