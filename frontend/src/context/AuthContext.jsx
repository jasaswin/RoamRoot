import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authApi from "../services/authApi";

const AuthContext = createContext(null);

// The login itself lives in an http-only cookie. This only keeps the user object for the UI.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      setCurrentUser(data.user || null);
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (values) => {
    const data = await authApi.login(values);
    setCurrentUser(data.user);
    queryClient.clear();
    return data.user;
  };

  const register = async (values) => {
    const data = await authApi.register(values);
    setCurrentUser(data.user);
    queryClient.clear();
    return data.user;
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    queryClient.clear();
  };

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isCreator: currentUser?.role === "CREATOR" || currentUser?.role === "ADMIN",
    isAdmin: currentUser?.role === "ADMIN",
    loading,
    login,
    register,
    logout,
    refreshUser,
    setCurrentUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
