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
import { PENDING_ORDERS_COUNT_REFRESH_EVENT } from "../lib/refresh-event";

const POLL_MS = 30_000;

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
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
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
