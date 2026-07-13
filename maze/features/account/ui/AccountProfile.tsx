"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/Field";
import {
  fetchUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/entities/user";
import { formatPhoneDisplay } from "@/features/auth/lib/phone";
import { useUserAuth } from "@/features/auth";
import { ApiError } from "@/lib/api";

export function AccountProfile() {
  const { getAccessToken } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState(false);
  const [subscribeSms, setSubscribeSms] = useState(false);

  function applyProfile(profile: UserProfile) {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ? formatPhoneDisplay(profile.phone) : "");
    setSubscribeEmail(profile.subscribeEmail);
    setSubscribeSms(profile.subscribeSms);
  }

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const profile = await fetchUserProfile(token);
        if (cancelled) return;
        applyProfile(profile);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Не удалось загрузить профиль",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const token = getAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      const profile = await updateUserProfile(token, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        subscribeEmail,
        subscribeSms,
      });
      applyProfile(profile);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось сохранить профиль",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="glass max-w-3xl rounded-3xl p-8 text-sm text-muted">
        Загружаем профиль…
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass max-w-3xl space-y-5 rounded-3xl p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
        />
        <Field
          label="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
        />
        <Field
          label="Телефон"
          type="tel"
          value={phone}
          readOnly
          disabled
          hint="Номер MAZE ID · изменить нельзя"
        />
        <Field
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={subscribeEmail}
            onChange={(e) => setSubscribeEmail(e.target.checked)}
            className="maze-check"
          />
          Согласен на e-mail рассылку
        </label>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={subscribeSms}
            onChange={(e) => setSubscribeSms(e.target.checked)}
            className="maze-check"
          />
          Согласен на SMS рассылку
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 text-sm text-ink"
        >
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-cyan">Изменения сохранены</p>
      )}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Сохраняем…" : "Сохранить изменения"}
      </button>
    </form>
  );
}
