"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function toErrorMessage(err: unknown, fallback = "Ошибка запроса") {
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export type AdminPagedFetchResult<T> = {
  items: T[];
  total: number;
  limit?: number;
};

/**
 * Shared paging for admin list pages: replace on filter/page change,
 * append for mobile infinite scroll / «Ещё».
 */
export function useAdminPagedList<T extends { id: string }>({
  limit = 20,
  resetKey,
  fetchPage,
}: {
  limit?: number;
  resetKey: string;
  fetchPage: (
    page: number,
    limit: number,
  ) => Promise<AdminPagedFetchResult<T>>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const pagesRef = useRef(1);
  pageRef.current = page;
  pagesRef.current = pages;

  const load = useCallback(
    async (opts: { page: number; append: boolean; silent?: boolean }) => {
      if (loadingRef.current && !opts.silent) return;
      loadingRef.current = true;
      if (!opts.silent) {
        setLoading(true);
        if (!opts.append) setError("");
      }
      try {
        const res = await fetchRef.current(opts.page, limit);
        const lim = res.limit ?? limit;
        const nextPages = Math.max(1, Math.ceil(res.total / lim));
        setItems((prev) => {
          if (!opts.append) return res.items;
          const seen = new Set(prev.map((x) => x.id));
          return [...prev, ...res.items.filter((x) => !seen.has(x.id))];
        });
        setPages(nextPages);
        setTotal(res.total);
        setPage(opts.page);
      } catch (e) {
        if (!opts.silent) setError(toErrorMessage(e));
      } finally {
        loadingRef.current = false;
        if (!opts.silent) setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    void load({ page: 1, append: false });
  }, [resetKey, load]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingRef.current) return;
        if (pageRef.current >= pagesRef.current) return;
        void load({ page: pageRef.current + 1, append: true });
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [load, resetKey]);

  return {
    items,
    setItems,
    page,
    pages,
    total,
    loading,
    error,
    setError,
    sentinelRef,
    load,
    reload: () => load({ page: 1, append: false }),
    loadMore: () => load({ page: page + 1, append: true }),
    goToPage: (p: number) => load({ page: p, append: false }),
    /** Re-fetch pages 1..current as one chunk (for background poll with append UX). */
    refreshAccumulated: async () => {
      const take = Math.max(limit, pageRef.current * limit);
      try {
        const res = await fetchRef.current(1, take);
        const lim = limit;
        setItems(res.items);
        setTotal(res.total);
        setPages(Math.max(1, Math.ceil(res.total / lim)));
      } catch {
        /* silent */
      }
    },
  };
}
