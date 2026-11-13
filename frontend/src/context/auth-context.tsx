import * as React from "react";
import { AuthContextType, AuthResponse, AuthState, LoginPayload, RegisterPayload } from "@/types/auth.types";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/utils/token-storage";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = React.useState<AuthState>(() => {
    // Initial synchronous read to avoid flash of unauthenticated state
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();

    if (token && user && !tokenStorage.isTokenExpired(token)) {
      return {
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      };
    }

    // Token was missing or expired: clean up
    if (token) {
      tokenStorage.clearAuth();
    }

    return {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  // Listen for unauthorized events emitted by the Axios response interceptor
  React.useEffect(() => {
    const handleUnauthorized = () => {
      setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      queryClient.clear();
    };

    window.addEventListener("evently:auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("evently:auth:unauthorized", handleUnauthorized);
    };
  }, [queryClient]);

  const login = React.useCallback(async (payload: LoginPayload): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.login(payload);
      tokenStorage.setAuth(response.token, response.user);
      setState({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.register(payload);
      tokenStorage.setAuth(response.token, response.user);
      setState({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = React.useCallback(() => {
    tokenStorage.clearAuth();
    setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    queryClient.clear();
  }, [queryClient]);

  const value = React.useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      register,
      logout,
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
