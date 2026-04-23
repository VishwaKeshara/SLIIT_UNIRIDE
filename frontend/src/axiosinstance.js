import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const isAdminApiRequest = config.url?.startsWith("/admin") ||
    config.url?.startsWith("/complaints") ||
    config.url?.startsWith("/bookings");

  if (adminToken && isAdminApiRequest) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  return config;
});

export default instance;
