"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Modal } from "@/components/modals";
import { Field } from "@/components/Field";
import { sendSmsCode } from "@/entities/user";
import { ApiError } from "@/lib/api";
import { formatPhoneDisplay, normalizePhone } from "../lib/phone";
import { useUserAuth } from "../model/user-auth-provider";

type Step = "phone" | "code";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { loginWithSms, isAuthenticated, ready } = useUserAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open || !ready) return;
    if (isAuthenticated) onClose();
  }, [open, ready, isAuthenticated, onClose]);

  function reset() {
    setStep("phone");
    setPhoneRaw("");
    setPhone("");
    setCode("");
    setDevCode(null);
    setError(null);
    setPending(false);
  }

  function close() {
    onClose();
    setTimeout(reset, 250);
  }

  function goBackToPhone() {
    setError(null);
    setCode("");
    setStep("phone");
    setPhoneRaw(phone ? formatPhoneDisplay(phone) : "");
  }

  async function onSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let normalized: string;
    try {
      normalized = normalizePhone(phoneRaw);
    } catch {
      setError("Введите номер в формате +7 (999) 123-45-67");
      return;
    }

    setPending(true);
    try {
      const result = await sendSmsCode(normalized);
      setPhone(normalized);
      setDevCode(result.devCode ?? null);
      setStep("code");
      setCode("");
    } catch (err) {
      if (err instanceof ApiError && err.code === "RATE_LIMIT_EXCEEDED") {
        setError("Слишком много запросов. Подождите и попробуйте снова.");
      } else {
        setError("Не удалось отправить код. Проверьте номер и что API запущен.");
      }
    } finally {
      setPending(false);
    }
  }

  async function onVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError("Сначала укажите номер телефона");
      goBackToPhone();
      return;
    }

    const trimmed = code.replace(/\D/g, "");
    if (trimmed.length !== 6) {
      setError("Введите 6-значный код из SMS");
      return;
    }

    setPending(true);
    try {
      await loginWithSms(phone, trimmed);
      close();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Неверный или просроченный код");
      } else {
        setError("Не удалось войти. Проверьте код и попробуйте снова.");
      }
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    if (!phone || pending) return;
    setError(null);
    setPending(true);
    try {
      const result = await sendSmsCode(phone);
      setDevCode(result.devCode ?? null);
      setCode("");
    } catch (err) {
      if (err instanceof ApiError && err.code === "RATE_LIMIT_EXCEEDED") {
        setError("Слишком много запросов. Подождите и попробуйте снова.");
      } else {
        setError("Не удалось отправить код повторно.");
      }
    } finally {
      setPending(false);
    }
  }

  const phoneLabel = phone ? formatPhoneDisplay(phone) : "ваш номер";

  return (
    <Modal open={open} onClose={close} title="Вход в MAZE ID">
      {step === "phone" ? (
        <form onSubmit={onSendCode} className="space-y-4">
          <p className="text-sm text-muted">
            Введите номер телефона — отправим SMS-код для входа в MAZE ID.
          </p>
          <Field
            label="Телефон"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            autoFocus={open}
            placeholder="+7 (999) 123-45-67"
            value={phoneRaw}
            onChange={(e) => setPhoneRaw(e.target.value)}
            disabled={pending}
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
            className="btn-primary w-full"
            disabled={pending || !ready}
          >
            {pending ? "Отправляем…" : "Получить код"}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-faint">
            <ShieldCheck size={13} className="text-cyan" />
            Код придёт в SMS в течение минуты
          </p>
        </form>
      ) : (
        <form onSubmit={onVerifyCode} className="space-y-4">
          <p className="text-sm text-muted">
            Код отправлен на{" "}
            <span className="text-ink">{phoneLabel}</span>
          </p>
          <Field
            label="Код из SMS"
            labelNote="6 цифр"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            autoFocus={open}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={pending}
          />
          {devCode && (
            <p className="text-xs text-cyan">
              Код для разработки: <span className="font-mono tracking-widest">{devCode}</span>
            </p>
          )}
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
            className="btn-primary w-full"
            disabled={pending || !ready}
          >
            {pending ? "Проверяем…" : "Войти"}
          </button>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={goBackToPhone}
              className="w-full text-center text-xs text-muted transition-colors hover:text-ink cursor-pointer"
              disabled={pending}
            >
              Изменить номер
            </button>
            <button
              type="button"
              onClick={() => void onResend()}
              className="w-full text-center text-xs text-muted transition-colors hover:text-ink cursor-pointer"
              disabled={pending}
            >
              Отправить код снова
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
