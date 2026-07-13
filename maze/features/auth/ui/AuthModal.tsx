"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Modal } from "@/components/modals";
import { Field } from "@/components/Field";
import { sendSmsCode } from "@/entities/user";
import { ApiError } from "@/lib/api";
import {
  e164ToNationalDisplay,
  formatPhoneDisplay,
  maskNationalPhoneInput,
  nationalPhoneToE164,
} from "@/lib/phone";
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
  const [phoneNational, setPhoneNational] = useState("");
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
    setPhoneNational("");
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
    setPhoneNational(phone ? e164ToNationalDisplay(phone) : "");
  }

  async function onSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let normalized: string;
    try {
      normalized = nationalPhoneToE164(phoneNational);
    } catch {
      setError("Введите номер полностью: (999) 123-45-67");
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
          <div className="space-y-1.5">
            <label
              htmlFor="auth-phone"
              className="block text-xs font-medium uppercase tracking-wider text-muted"
            >
              Телефон
            </label>
            <div className="flex w-full items-center gap-1.5 rounded-xl border border-line bg-bg-2/60 px-4 transition-colors outline-none focus-within:border-cyan/70 focus-within:outline-none">
              <span className="shrink-0 text-[15px] text-ink">+7</span>
              <input
                id="auth-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                required
                autoFocus={open}
                placeholder="(999) 123-45-67"
                value={phoneNational}
                onChange={(e) =>
                  setPhoneNational(maskNationalPhoneInput(e.target.value))
                }
                disabled={pending}
                className="input-inset min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-ink placeholder:text-faint shadow-none outline-none"
              />
            </div>
          </div>
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
