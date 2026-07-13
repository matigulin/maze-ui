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
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";
import { fetchPendingOrdersCount } from "../api/pending-orders-count";
import { ADMIN_ORDERS_POLL_MS } from "../lib/poll";
import { PENDING_ORDERS_COUNT_REFRESH_EVENT } from "../lib/refresh-event";

type PendingOrdersCountStore = {
  count: number;
  ready: boolean;
  refresh: () => Promise<void>;
};

const PendingOrdersCountContext =
  createContext<PendingOrdersCountStore | null>(null);

export function PendingOrdersCountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { ready: authReady, isStaff, accessToken, refreshSession } =
    useStaffAuth();
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!isStaff) {
      setCount(0);
      setReady(true);
      return;
    }

    try {
      let token = accessToken;
      if (!token) token = await refreshSession();
      if (!token) {
        setCount(0);
        return;
      }
      const next = await fetchPendingOrdersCount(token);
      setCount(next);
    } catch {
      /* ignore transient errors — keep last count */
    } finally {
      setReady(true);
    }
  }, [isStaff, accessToken, refreshSession]);

  useEffect(() => {
    if (!authReady) return;
    void refresh();
  }, [authReady, refresh]);

  useEffect(() => {
    if (!authReady || !isStaff) return;

    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void refresh();
    }, ADMIN_ORDERS_POLL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") void refresh();
    }
    function onFocus() {
      void refresh();
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [authReady, isStaff, refresh]);

  useEffect(() => {
    function onRefresh() {
      void refresh();
    }
    window.addEventListener(PENDING_ORDERS_COUNT_REFRESH_EVENT, onRefresh);
    return () =>
      window.removeEventListener(PENDING_ORDERS_COUNT_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  const value = useMemo(
    () => ({ count, ready, refresh }),
    [count, ready, refresh],
  );

  return (
    <PendingOrdersCountContext.Provider value={value}>
      {children}
    </PendingOrdersCountContext.Provider>
  );
}

export function usePendingOrdersCount() {
  const ctx = useContext(PendingOrdersCountContext);
  if (!ctx) {
    throw new Error(
      "usePendingOrdersCount must be used within PendingOrdersCountProvider",
    );
  }
  return ctx;
}
