/** Откладывает вызов до после commit — fetch в useEffect без sync setState. */
export function runAfterCommit(fn: () => void | Promise<void>) {
  void Promise.resolve().then(() => fn());
}
