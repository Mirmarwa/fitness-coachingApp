import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "../services/api";
import {
  applyUserSession,
  clearAuthStorage,
  parseTokenPayload,
  userFromTokenPayload,
} from "../utils/authSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const profile = await getProfile();
      applyUserSession(profile);
      setUser(profile);
      return profile;
    } catch {
      const fallback = userFromTokenPayload(parseTokenPayload(token));
      if (fallback) {
        applyUserSession(fallback);
        setUser(fallback);
        return fallback;
      }
      clearAuthStorage();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && localStorage.getItem("access")),
      isStaff: Boolean(user?.is_staff),
      isCoach: user?.role === "coach",
      isClient: user?.role === "client",
      refreshProfile,
      logout,
      setUser,
    }),
    [user, loading, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return ctx;
}
