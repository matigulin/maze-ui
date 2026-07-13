"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/Field";
import {
  fetchUserProfile,
  updateUserProfile,
  type UserGender,
  type UserProfile,
} from "@/entities/user";
import { ApiError } from "@/lib/api";
import { formatPhoneDisplay } from "@/lib/phone";
import {
  formatBirthDateDisplay,
  maskBirthDateInput,
  parseBirthDateInput,
} from "../lib/birth-date";

type Gender = "" | UserGender;

export type AccountProfileProps = {
  ensureAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
};

export function AccountProfile({
  ensureAccessToken,
  isAuthenticated,
}: AccountProfileProps) {
  const [loading, setLoading] = useState(isAuthenticated);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState(false);
  const [subscribeSms, setSubscribeSms] = useState(false);

  function applyProfile(profile: UserProfile) {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setMiddleName(profile.middleName ?? "");
    setGender(
      profile.gender === "male" || profile.gender === "female"
        ? profile.gender
        : "",
    );
    setEmail(profile.email ?? "");
    setPhone(profile.phone ? formatPhoneDisplay(profile.phone) : "");
    setBirthDate(formatBirthDateDisplay(profile.birthDate));
    setSubscribeEmail(profile.subscribeEmail);
    setSubscribeSms(profile.subscribeSms);
  }

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await ensureAccessToken();
        if (cancelled || !token) {
          if (!cancelled) setError("Сессия истекла. Войдите снова.");
          return;
        }
        const profile = await fetchUserProfile(token);
        if (cancelled) return;
        applyProfile(profile);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          const next = await ensureAccessToken();
          if (cancelled) return;
          if (next) {
            try {
              applyProfile(await fetchUserProfile(next));
              return;
            } catch {
              /* fall through */
            }
          }
          setError("Сессия истекла. Войдите снова.");
          return;
        }
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
  }, [ensureAccessToken, isAuthenticated]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    let parsedBirthDate: string | null;
    try {
      parsedBirthDate = parseBirthDateInput(birthDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Некорректная дата рождения");
      return;
    }

    setSaving(true);
    try {
      let token = await ensureAccessToken();
      if (!token) {
        setError("Сессия истекла. Войдите снова.");
        return;
      }

      const body = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        middleName: middleName.trim() ? middleName.trim() : null,
        email: email.trim() || undefined,
        gender: gender || null,
        birthDate: parsedBirthDate,
        subscribeEmail,
        subscribeSms,
      };

      try {
        applyProfile(await updateUserProfile(token, body));
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 401)) throw err;
        token = await ensureAccessToken();
        if (!token) throw err;
        applyProfile(await updateUserProfile(token, body));
      }
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
      className="glass max-w-3xl space-y-8 rounded-3xl p-6 sm:p-8"
    >
      <section className="space-y-5">
        <h2 className="eyebrow">Обо мне</h2>
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
            label="Отчество"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            autoComplete="additional-name"
          />
          <div className="space-y-1.5">
            <span className="block text-xs font-medium uppercase tracking-wider text-muted">
              Пол
            </span>
            <div className="flex gap-4 pt-2">
              {(
                [
                  { value: "male", label: "М" },
                  { value: "female", label: "Ж" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-muted"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={gender === opt.value}
                    onChange={() => setGender(opt.value)}
                    className="maze-check"
                  />
                  {opt.label}
                </label>
              ))}
              {gender && (
                <button
                  type="button"
                  onClick={() => setGender("")}
                  className="text-xs text-faint transition-colors hover:text-muted cursor-pointer"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
          <Field
            label="Мобильный телефон"
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
          <Field
            label="Дата рождения"
            value={birthDate}
            onChange={(e) => setBirthDate(maskBirthDateInput(e.target.value))}
            placeholder="ДД.ММ.ГГГГ"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            hint="Только цифры, точки подставятся автоматически"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow">Коммуникации</h2>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={subscribeEmail}
            onChange={(e) => setSubscribeEmail(e.target.checked)}
            className="maze-check"
          />
          Согласие на e-mail рассылку
        </label>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={subscribeSms}
            onChange={(e) => setSubscribeSms(e.target.checked)}
            className="maze-check"
          />
          Согласие на SMS рассылку
        </label>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 text-sm text-ink"
        >
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-cyan">Изменения сохранены</p>}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Сохраняем…" : "Сохранить изменения"}
      </button>
    </form>
  );
}
