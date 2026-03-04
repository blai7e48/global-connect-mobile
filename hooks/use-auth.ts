import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Attempt to restore the user from local cache first (instant),
   * then validate against the server in the background.
   * If the server call fails but we have a cached user, keep them signed in
   * (graceful degradation — the session cookie may have expired but the
   * user can still browse cached data until they take an action that requires auth).
   */
  const fetchUser = useCallback(async () => {
    console.log("[useAuth] fetchUser called");
    try {
      setError(null);

      // === Step 1: Restore cached user instantly (both web and native) ===
      const cachedUser = await Auth.getUserInfo();
      if (cachedUser) {
        console.log("[useAuth] Restored cached user:", cachedUser.name);
        setUser(cachedUser);
        setLoading(false); // Stop showing loading spinner immediately
      }

      // === Step 2: Validate with server in background ===
      if (Platform.OS === "web") {
        console.log("[useAuth] Web: validating session with API...");
        try {
          const apiUser = await Api.getMe();
          if (apiUser) {
            const userInfo: Auth.User = {
              id: apiUser.id,
              openId: apiUser.openId,
              name: apiUser.name,
              email: apiUser.email,
              loginMethod: apiUser.loginMethod,
              lastSignedIn: new Date(apiUser.lastSignedIn),
            };
            setUser(userInfo);
            await Auth.setUserInfo(userInfo);
            console.log("[useAuth] Web user refreshed from API:", userInfo.name);
          } else if (!cachedUser) {
            // No API user AND no cached user — truly not authenticated
            console.log("[useAuth] Web: No authenticated user (no cache, no API)");
            setUser(null);
            await Auth.clearUserInfo();
          }
          // If API returns null but we have cachedUser, keep the cached user
          // (session cookie may have expired but user data is still valid for display)
        } catch (apiErr) {
          console.warn("[useAuth] Web API validation failed:", apiErr);
          // Keep cached user if available — graceful degradation
          if (!cachedUser) {
            setUser(null);
          }
        }
      } else {
        // Native platform: use token-based auth
        console.log("[useAuth] Native: checking session token...");
        const sessionToken = await Auth.getSessionToken();
        if (!sessionToken && !cachedUser) {
          console.log("[useAuth] Native: No token and no cache, user is null");
          setUser(null);
        }
        // If we have a cached user (set above), keep them signed in
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user");
      console.error("[useAuth] fetchUser error:", error);
      setError(error);
      // Only clear user if we have no cached fallback
      const cachedUser = await Auth.getUserInfo();
      if (!cachedUser) {
        setUser(null);
      }
    } finally {
      setLoading(false);
      console.log("[useAuth] fetchUser completed");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } catch (err) {
      console.error("[Auth] Logout API call failed:", err);
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      setUser(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    console.log("[useAuth] useEffect triggered, autoFetch:", autoFetch);
    if (autoFetch) {
      // For both web and native: try cached user first for instant load
      Auth.getUserInfo().then((cachedUser) => {
        if (cachedUser) {
          console.log("[useAuth] Instant restore from cache:", cachedUser.name);
          setUser(cachedUser);
          setLoading(false);
        }
        // Then validate with server
        fetchUser();
      });
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    refresh: fetchUser,
    logout,
  };
}
