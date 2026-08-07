"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  authService,
  userDisplayName,
  fetchUserProfile,
  type AuthUser,
} from "@/entities/user";
import { ApiError } from "@/lib/api";

const USER_PROFILE_KEY = "maze:user-profile";
/** Обновлять access-токен за минуту до истечения (TTL на бэке — 15 мин). */
const REFRESH_SKEW_MS = 60_000;
/** Если до expiry меньше — считаем токен «почти протухшим». */
const STALE_TOKEN_MS = 30_000;

type UserAuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  displayName: string;
  loginWithSms: (phone: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  /** Актуальный Bearer: обновит сессию, если токен протух или скоро истечёт. */
  ensureAccessToken: () => Promise<string | null>;
  refreshSession: () => Promise<string | null>;
};

const UserAuthContext = createContext<UserAuthState | null>(null);

function readCachedProfile(): Partial<AuthUser> | null {
  try {
    const raw = sessionStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AuthUser>;
  } catch {
    return null;
  }
}

function writeCachedProfile(user: AuthUser) {
  try {
    sessionStorage.setItem(
      USER_PROFILE_KEY,
      JSON.stringify({
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}

function clearCachedProfile() {
  try {
    sessionStorage.removeItem(USER_PROFILE_KEY);
  } catch {
    // ignore
  }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const expiresAtRef = useRef<number | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    expiresAtRef.current = tokenExpiresAt;
  }, [tokenExpiresAt]);

  function applyAccessToken(token: string, expiresInSec: number) {
    setAccessToken(token);
    setTokenExpiresAt(Date.now() + expiresInSec * 1000);
  }

  function clearSession() {
    clearCachedProfile();
    setAccessToken(null);
    setTokenExpiresAt(null);
    setUser(null);
  }

  async function hydrateUserFromToken(token: string) {
    const cached = readCachedProfile();
    if (cached?.id) {
      setUser({
        id: cached.id,
        phone: cached.phone ?? "",
        firstName: cached.firstName ?? null,
        lastName: cached.lastName ?? null,
      });
      return;
    }

    try {
      const profile = await fetchUserProfile(token);
      const next: AuthUser = {
        id: profile.id,
        phone: profile.phone,
        firstName: profile.firstName,
        lastName: profile.lastName,
      };
      writeCachedProfile(next);
      setUser(next);
    } catch {
      setUser(null);
    }
  }

  const refreshSession = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;

    refreshInFlight.current = (async () => {
      try {
        const result = await authService.refreshSession();
        applyAccessToken(result.accessToken, result.expiresIn);
        await hydrateUserFromToken(result.accessToken);
        return result.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const result = await authService.refreshSession();
        if (cancelled) return;
        applyAccessToken(result.accessToken, result.expiresIn);
        await hydrateUserFromToken(result.accessToken);
      } catch (err) {
        if (cancelled) return;
        if (!(err instanceof ApiError && err.status === 401)) {
          console.warn("[user] session restore failed", err);
        }
        clearSession();
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Проактивный refresh до истечения access-токена. */
  useEffect(() => {
    if (!accessToken || !tokenExpiresAt || !user) return;

    const delay = Math.max(tokenExpiresAt - Date.now() - REFRESH_SKEW_MS, 5_000);
    const timer = window.setTimeout(() => {
      void refreshSession();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [accessToken, tokenExpiresAt, user, refreshSession]);

  /** Вернулись на вкладку — подтянуть токен, если скоро истечёт. */
  useEffect(() => {
    if (!user) return;

    function maybeRefresh() {
      if (document.visibilityState === "hidden") return;
      const expiresAt = expiresAtRef.current;
      if (!expiresAt || expiresAt - Date.now() < 90_000) {
        void refreshSession();
      }
    }

    document.addEventListener("visibilitychange", maybeRefresh);
    window.addEventListener("focus", maybeRefresh);
    return () => {
      document.removeEventListener("visibilitychange", maybeRefresh);
      window.removeEventListener("focus", maybeRefresh);
    };
  }, [user, refreshSession]);

  const loginWithSms = useCallback(async (phone: string, code: string) => {
    const result = await authService.verifyCode(phone, code);
    writeCachedProfile(result.user);
    applyAccessToken(result.accessToken, result.expiresIn);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // clear local session even if API revoke fails
    }
    clearSession();
  }, []);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const ensureAccessToken = useCallback(async () => {
    const token = accessTokenRef.current;
    const expiresAt = expiresAtRef.current;
    if (token && expiresAt && expiresAt - Date.now() > STALE_TOKEN_MS) {
      return token;
    }
    return refreshSession();
  }, [refreshSession]);

  const value = useMemo<UserAuthState>(
    () => ({
      user,
      accessToken,
      ready,
      isAuthenticated: Boolean(user && accessToken),
      displayName: userDisplayName(user),
      loginWithSms,
      logout,
      getAccessToken,
      ensureAccessToken,
      refreshSession,
    }),
    [
      user,
      accessToken,
      ready,
      loginWithSms,
      logout,
      getAccessToken,
      ensureAccessToken,
      refreshSession,
    ],
  );

  return (
    <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return ctx;
}
