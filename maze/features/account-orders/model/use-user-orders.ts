"use client";

import { useCallback, useEffect, useState } from "react";
import { runAfterCommit } from "@/lib/run-after-commit";
import { shouldUseMocks } from "@/lib/mocks";
import {
  fetchUserOrders,
  USER_ORDERS_PAGE_LIMIT,
  type UserOrderListItem,
} from "../api/user-orders-api";
import { CUSTOMER_ORDERS_POLL_MS } from "../lib/poll";
import { ACCOUNT_ORDERS_REFRESH_EVENT } from "@/lib/account-orders-refresh";

type UseUserOrdersResult = {
  orders: UserOrderListItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useUserOrders(
  ensureAccessToken: () => Promise<string | null>,
  enabled: boolean,
): UseUserOrdersResult {
  const useMocks = shouldUseMocks();
  const [orders, setOrders] = useState<UserOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || useMocks) {
      setOrders([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const token = await ensureAccessToken();
      if (!token) {
        setOrders([]);
        return;
      }
      const next = await fetchUserOrders(token, {
        page: 1,
        limit: USER_ORDERS_PAGE_LIMIT,
      });
      setOrders(next);
      setError(null);
    } catch {
      setError("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  }, [enabled, useMocks, ensureAccessToken]);

  useEffect(() => {
    if (!enabled) return;
    runAfterCommit(() => refresh());
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || useMocks) return;

    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void refresh();
    }, CUSTOMER_ORDERS_POLL_MS);

    function onVisible() {
      if (document.visibilityState === "visible") void refresh();
    }
    function onFocus() {
      void refresh();
    }
    function onRefreshEvent() {
      void refresh();
    }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener(ACCOUNT_ORDERS_REFRESH_EVENT, onRefreshEvent);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(ACCOUNT_ORDERS_REFRESH_EVENT, onRefreshEvent);
    };
  }, [enabled, useMocks, refresh]);

  return { orders, loading, error, refresh };
}
