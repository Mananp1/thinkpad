import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:5001/api",
});

=======
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("auth0_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

>>>>>>> 884855a (New Features)
export default api;
