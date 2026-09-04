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
  staffDisplayName,
  staffLogin,
  staffLogout,
  staffRefresh,
  type StaffUser,
} from "@/lib/staff-auth";
import { ApiError } from "@/lib/api";

const STAFF_PROFILE_KEY = "maze:staff-profile";

type StaffAuthState = {
  staff: StaffUser | null;
  accessToken: string | null;
  ready: boolean;
  displayName: string;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<StaffUser>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  /** Soft refresh; returns new access token or null */
  refreshSession: () => Promise<string | null>;
};

const StaffAuthContext = createContext<StaffAuthState | null>(null);

function readCachedProfile(): Partial<StaffUser> | null {
  try {
    const raw = sessionStorage.getItem(STAFF_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<StaffUser>;
  } catch {
    return null;
  }
}

function writeCachedProfile(staff: StaffUser) {
  try {
    sessionStorage.setItem(
      STAFF_PROFILE_KEY,
      JSON.stringify({
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}

function clearCachedProfile() {
  try {
    sessionStorage.removeItem(STAFF_PROFILE_KEY);
  } catch {
    // ignore
  }
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const result = await staffRefresh();
        if (cancelled) return;
        const cached = readCachedProfile();
        setAccessToken(result.accessToken);
        setStaff({
          id: result.staff.id,
          role: result.staff.role,
          email: cached?.email,
          firstName: cached?.firstName ?? null,
          lastName: cached?.lastName ?? null,
        });
      } catch (err) {
        if (cancelled) return;
        if (!(err instanceof ApiError && err.status === 401)) {
          console.warn("[staff] session restore failed", err);
        }
        clearCachedProfile();
        setAccessToken(null);
        setStaff(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await staffLogin(email.trim().toLowerCase(), password);
    const next: StaffUser = {
      id: result.staff.id,
      role: result.staff.role,
      email: result.staff.email,
      firstName: result.staff.firstName,
      lastName: result.staff.lastName,
    };
    writeCachedProfile(next);
    setAccessToken(result.accessToken);
    setStaff(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await staffLogout();
    } catch {
      // clear local session even if API revoke fails
    }
    clearCachedProfile();
    setAccessToken(null);
    setStaff(null);
  }, []);

  const getAccessToken = useCallback(() => accessToken, [accessToken]);

  const refreshSession = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;

    refreshInFlight.current = (async () => {
      try {
        const result = await staffRefresh();
        const cached = readCachedProfile();
        setAccessToken(result.accessToken);
        setStaff({
          id: result.staff.id,
          role: result.staff.role,
          email: cached?.email,
          firstName: cached?.firstName ?? null,
          lastName: cached?.lastName ?? null,
        });
        return result.accessToken;
      } catch {
        clearCachedProfile();
        setAccessToken(null);
        setStaff(null);
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, []);

  const value = useMemo<StaffAuthState>(
    () => ({
      staff,
      accessToken,
      ready,
      displayName: staffDisplayName(staff),
      isAdmin: staff?.role === "admin",
      isStaff: Boolean(staff),
      login,
      logout,
      getAccessToken,
      refreshSession,
    }),
    [staff, accessToken, ready, login, logout, getAccessToken, refreshSession],
  );

  return (
    <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) {
    throw new Error("useStaffAuth must be used within StaffAuthProvider");
  }
  return ctx;
}
