"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  logoutUser,
  refreshUserSession,
  userDisplayName,
  verifySmsCode,
  fetchUserProfile,
  type AuthUser,
} from "@/entities/user";
import { ApiError } from "@/lib/api";

const USER_PROFILE_KEY = "maze:user-profile";

type UserAuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  displayName: string;
  loginWithSms: (phone: string, code: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const result = await refreshUserSession();
        if (cancelled) return;

        const cached = readCachedProfile();
        if (cached?.id) {
          setAccessToken(result.accessToken);
          setUser({
            id: cached.id,
            phone: cached.phone ?? "",
            firstName: cached.firstName ?? null,
            lastName: cached.lastName ?? null,
          });
          return;
        }

        try {
          const profile = await fetchUserProfile(result.accessToken);
          if (cancelled) return;
          const next: AuthUser = {
            id: profile.id,
            phone: profile.phone,
            firstName: profile.firstName,
            lastName: profile.lastName,
          };
          writeCachedProfile(next);
          setAccessToken(result.accessToken);
          setUser(next);
        } catch {
          if (cancelled) return;
          setAccessToken(result.accessToken);
          setUser(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (!(err instanceof ApiError && err.status === 401)) {
          console.warn("[user] session restore failed", err);
        }
        clearCachedProfile();
        setAccessToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithSms = useCallback(async (phone: string, code: string) => {
    const result = await verifySmsCode(phone, code);
    writeCachedProfile(result.user);
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // clear local session even if API revoke fails
    }
    clearCachedProfile();
    setAccessToken(null);
    setUser(null);
  }, []);

  const getAccessToken = useCallback(() => accessToken, [accessToken]);

  const refreshSession = useCallback(async () => {
    try {
      const result = await refreshUserSession();
      const cached = readCachedProfile();
      setAccessToken(result.accessToken);

      if (cached?.id) {
        setUser({
          id: cached.id,
          phone: cached.phone ?? "",
          firstName: cached.firstName ?? null,
          lastName: cached.lastName ?? null,
        });
        return result.accessToken;
      }

      try {
        const profile = await fetchUserProfile(result.accessToken);
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

      return result.accessToken;
    } catch {
      clearCachedProfile();
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

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
      refreshSession,
    }),
    [user, accessToken, ready, loginWithSms, logout, getAccessToken, refreshSession],
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
