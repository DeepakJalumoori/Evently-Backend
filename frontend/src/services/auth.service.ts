import { apiClient } from "./api-client";
import { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth.types";

export const authService = {
  /**
   * Authenticates user against POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth/login", payload);
    return response.data;
  },

  /**
   * Registers a new attendee or organizer against POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/auth/register", payload);
    return response.data;
  },
};
