"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";
import { ApiError } from "@/lib/api";

export default function StaffLoginPage() {
  const router = useRouter();
  const { ready, isStaff, login } = useStaffAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!ready || !isStaff) return;
    router.replace("/admin");
  }, [ready, isStaff, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.code === "RATE_LIMIT_EXCEEDED"
            ? "Слишком много попыток. Подождите и попробуйте снова."
            : "Неверный email или пароль.",
        );
      } else {
        setError("Не удалось войти. Проверьте, что API запущен.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-10">
        <Logo />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-line bg-panel/80 p-8 shadow-[0_0_60px_-20px_rgba(53,228,240,0.25)]">
        <p className="font-display text-[11px] uppercase tracking-[0.35em] text-cyan">
          Staff
        </p>
        <h1 className="mt-2 font-display text-2xl tracking-wide text-ink">
          Вход в панель
        </h1>
        <p className="mt-2 text-sm text-muted">
          Панель управления магазином MAZE.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@maze.ru"
          />
          <Field
            label="Пароль"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 text-sm text-ink"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !ready}
            className="w-full rounded-xl bg-cyan/90 px-4 py-3 font-display text-sm font-semibold tracking-wider text-bg transition hover:bg-cyan disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Вход…" : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-faint">
          <Link
            href="/"
            className="text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            ← На витрину
          </Link>
        </p>
      </div>
    </div>
  );
}
