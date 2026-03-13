import { useCallback, useEffect, useState } from "react";
import {
  clearAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
  verifyAdminPassword,
} from "../utils/admin-auth.js";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState(() => getStoredAdminPassword());
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedPassword = getStoredAdminPassword();
      if (!storedPassword) {
        if (!cancelled) setCheckingAuth(false);
        return;
      }

      const result = await verifyAdminPassword(storedPassword);
      if (cancelled) return;

      if (result.ok) {
        setPassword(storedPassword);
        setIsAuthenticated(true);
        setError("");
      } else {
        clearAdminPassword();
        setPassword("");
        setIsAuthenticated(false);
      }

      setCheckingAuth(false);
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async () => {
    const result = await verifyAdminPassword(password);
    if (!result.ok) {
      clearAdminPassword();
      setIsAuthenticated(false);
      setError(result.error);
      return false;
    }

    storeAdminPassword(password);
    setIsAuthenticated(true);
    setError("");
    return true;
  }, [password]);

  return {
    checkingAuth,
    error,
    isAuthenticated,
    login,
    password,
    setError,
    setPassword,
  };
}
