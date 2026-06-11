import axios from "axios";

// const baseURL = "http://127.0.0.1:8000/api/";
const baseURL = "http://54.183.89.14/api/";

console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 60000,
});

const publicEndpoints = [
  "/login/",
  "/register/",
  "/signup/",
  "/send-email-otp/",
  "/verify-email-otp/",
  "/send-login-otp/",
  "/token/refresh/",
  "/token/",
  "/companies/",
];

// REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access");
    const requestUrl = config.url || "";

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    // Set content type only when caller didn't set one explicitly
    if (!config.headers["Content-Type"]) {
      if (config.data instanceof FormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      } else {
        config.headers["Content-Type"] = "application/json";
      }
    }

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔐 Request to ${requestUrl}: Token added`);
    } else if (isPublicEndpoint) {
      console.log(`🌐 Public request to ${requestUrl}: No token needed`);
    } else {
      console.log(`⚠️ Request to ${requestUrl}: No token available`);
    }

//     console.log(`📤 ${config.method?.toUpperCase()} ${requestUrl}`);

//     if (config.data && !(config.data instanceof FormData)) {
//       console.log("Request data:", config.data);
//     }

//     return config;
//   },
//   (error) => {
//     console.error("Request interceptor error:", error);
//     return Promise.reject(error);
//   }
// );
  console.log(`📤 ${config.method?.toUpperCase()} ${requestUrl}`);
 
    const isSensitiveEndpoint = ["login", "register", "signup"].some((endpoint) =>
      requestUrl.toLowerCase().includes(endpoint)
    );
 
    if (config.data && !(config.data instanceof FormData) && !isSensitiveEndpoint) {
      console.log("Request data:", config.data);
    } else if (config.data && isSensitiveEndpoint) {
 
      console.log("Request data: [PROTECTED  - SENSITIVE DATA HIDDEN]");
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// RESPONSE interceptor
api.interceptors.response.use(
  (response) => {
    console.log(
      `${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`,
      error.response?.status
    );
    console.error("Error details:", error.response?.data);

    // If no request config exists, just reject
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 once by trying refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = sessionStorage.getItem("refresh");
      const requestUrl = originalRequest.url || "";

      // Do not force reload here
      if (!refreshToken || requestUrl.includes("/token/refresh/")) {
        console.log("No refresh token or refresh request failed");
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        sessionStorage.removeItem("user_type");
        sessionStorage.removeItem("user_data");
        sessionStorage.removeItem("user_id");
        sessionStorage.removeItem("userRole");
        return Promise.reject(error);
      }

      try {
        console.log("🔄 Attempting to refresh access token...");

        const response = await axios.post(`${baseURL}token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        sessionStorage.setItem("access", newAccessToken);
        console.log("Token refreshed successfully");

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        sessionStorage.removeItem("user_type");
        sessionStorage.removeItem("user_data");
        sessionStorage.removeItem("user_id");
        sessionStorage.removeItem("userRole");

        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      console.error("Forbidden - User doesn't have permission");
    } else if (error.response?.status === 404) {
      console.error("Not found - Endpoint doesn't exist");
    } else if (error.response?.status === 500) {
      console.error("Server error - Please try again later");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout - Please check your connection");
    } else if (!error.response) {
      console.error("Network error - Please check your connection");
    }

    return Promise.reject(error);
  }
);

export const isAuthenticated = () => {
  const token = sessionStorage.getItem("access");
  return !!token;
};

export const getUserType = () => {
  return sessionStorage.getItem("user_type");
};

export const logout = () => {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("user_type");
  sessionStorage.removeItem("user_data");
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("userRole");
};

export default api;
