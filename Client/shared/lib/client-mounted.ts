"use client";

/** Стабильная подписка-заглушка для useSyncExternalStore (client-only mount). */
function subscribeNoop() {
  return () => {};
}

export function getClientSnapshot() {
  return true;
}

export function getServerSnapshot() {
  return false;
}

export { subscribeNoop };
