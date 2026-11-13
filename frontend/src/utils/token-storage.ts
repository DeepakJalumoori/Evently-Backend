import { User } from "@/types/auth.types";

const TOKEN_KEY = "evently_auth_token";
const USER_KEY = "evently_auth_user";

/**
 * Safely decodes the payload of a JWT without external libraries.
 */
function parseJwtPayload(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const tokenStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  setAuth(token: string, user: User): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error("Failed to persist auth token:", err);
    }
  },

  clearAuth(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error("Failed to clear auth storage:", err);
    }
  },

  isTokenExpired(token: string): boolean {
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp) return true;
    // exp is in seconds, Date.now() in ms
    return payload.exp * 1000 <= Date.now();
  },
};
