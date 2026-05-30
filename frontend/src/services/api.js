import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

let activeRequests = 0;

const notifyLoading = () => {
  window.dispatchEvent(
    new CustomEvent("api-loading", {
      detail: { active: activeRequests > 0 }
    })
  );
};

api.interceptors.request.use(
  (config) => {
    activeRequests += 1;
    notifyLoading();
    return config;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoading();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoading();
    return response;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoading();
    return Promise.reject(error);
  }
);

export const apiBaseUrl = api.defaults.baseURL;

export default api;
