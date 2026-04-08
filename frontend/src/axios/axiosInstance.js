/**
 * @fileoverview Centralized Axios instance configuration.
 * Handles base URL, automatic authorization header injection,
 * and global response error handling (e.g., token invalidation).
 */

import axios from "axios";
import { useAppStore } from "../store/useAppStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4015";

/**
 * Custom Axios instance with pre-configured settings.
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
});

/**
 * Request Interceptor:
 * Automatically injects the JWT Authorization header if a token exists in the store.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor:
 * Globally handles status codes and specific error messages.
 * Specifically detects "Invalid token." or 401 Unauthorized to trigger a global logout.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Check for token invalidation specific error message or 401 status
    if (
      response?.status === 401 || 
      response?.data?.error === "Invalid token."
    ) {
      // Clear local state and session
      useAppStore.getState().logout();
      
      // Force redirect to login page
      // Using window.location instead of navigate because this is outside the React lifecycle
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  },
);

export default axiosInstance;
