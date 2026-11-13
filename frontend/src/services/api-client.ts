import axios, { AxiosError } from "axios";
import { tokenStorage } from "@/utils/token-storage";
import { ApiErrorResponse } from "@/types/api.types";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear credentials immediately
      tokenStorage.clearAuth();

      // Dispatch global event for AuthContext to sync state
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("evently:auth:unauthorized"));

        // Only redirect if not already on /login or /register
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          const redirect = encodeURIComponent(currentPath);
          window.location.href = `/login?expired=true&redirect=${redirect}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-facing error message from an Axios error or backend API response.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    // 1. Check for top-level message (e.g. 401 "Invalid email or password", 409 "Email already registered")
    if (data?.message) {
      return data.message;
    }

    // 2. Check for Zod validation error list from backend
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map((issue) => issue.message).join(". ");
    }

    // 3. Status-specific fallback messages
    if (error.response?.status === 403) {
      return "Access denied. You do not have permission to perform this action.";
    }
    if (error.response?.status === 404) {
      return "Requested resource not found.";
    }
    if (error.response?.status === 500) {
      return "Internal server error. Please try again later.";
    }

    // 4. Network or connectivity errors
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      return "Cannot connect to the backend server. Please verify the API is running at " + baseURL;
    }

    return error.message || "An unexpected error occurred.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
