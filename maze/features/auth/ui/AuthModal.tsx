"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Modal } from "@/components/modals";
import { PhoneNationalField } from "@/components/PhoneNationalField";
import { authService } from "@/entities/user";
import { ApiError } from "@/lib/api";
import {
  digitsOnly,
  e164ToNationalDisplay,
  formatPhoneDisplay,
  isValidRussianMobile,
  validateRussianMobile,
} from "@/lib/phone";
import { useUserAuth } from "../model/user-auth-provider";
import { OtpCodeInput } from "./OtpCodeInput";

type Step = "phone" | "code";

const RESEND_SEC = 30;

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
  const [forcePhoneError, setForcePhoneError] = useState(false);
  const [pending, setPending] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!open || !ready) return;
    if (isAuthenticated) onClose();
  }, [open, ready, isAuthenticated, onClose]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  function reset() {
    setStep("phone");
    setPhoneNational("");
    setPhone("");
    setCode("");
    setDevCode(null);
    setError(null);
    setForcePhoneError(false);
    setPending(false);
    setResendIn(0);
  }

  function close() {
    onClose();
    setTimeout(reset, 250);
  }

  function goBackToPhone() {
    setError(null);
    setForcePhoneError(false);
    setCode("");
    setResendIn(0);
    setStep("phone");
    setPhoneNational(phone ? e164ToNationalDisplay(phone) : "");
  }

  function startResendTimer() {
    setResendIn(RESEND_SEC);
  }

  async function requestCode(e164: string) {
    const result = await authService.sendCode(e164);
    setPhone(e164);
    setDevCode(result.devCode ?? null);
    setCode("");
    setStep("code");
    startResendTimer();
  }

  async function onSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validated = validateRussianMobile(phoneNational);
    if (!validated.ok) {
      setForcePhoneError(true);
      return;
    }

    setForcePhoneError(false);
    setPending(true);
    try {
      await requestCode(validated.e164);
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

    const trimmed = digitsOnly(code);
    if (trimmed.length !== 4) {
      setError("Введите 4-значный код из SMS");
      return;
    }

    setPending(true);
    try {
      await loginWithSms(phone, trimmed);
      close();
    } catch (err) {
      if (err instanceof ApiError) {
        const invalid =
          err.code === "UNAUTHORIZED" ||
          err.code === "VALIDATION_ERROR" ||
          /неверн|invalid|expired|просроч/i.test(err.message);
        setError(
          invalid
            ? "Неверный код. Попробуйте ещё раз."
            : err.message || "Неверный код. Попробуйте ещё раз.",
        );
      } else {
        setError("Неверный код. Попробуйте ещё раз.");
      }
    } finally {
      setPending(false);
    }
  }

  async function onResend() {
    if (!phone || pending || resendIn > 0) return;
    setError(null);
    setPending(true);
    try {
      const result = await authService.sendCode(phone);
      setDevCode(result.devCode ?? null);
      setCode("");
      startResendTimer();
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
  const phoneValid = isValidRussianMobile(phoneNational);
  const canSubmitPhone = !pending && ready && phoneValid;
  const canSubmitCode = !pending && ready && digitsOnly(code).length === 4;
  const canResend = !pending && resendIn <= 0;

  return (
    <Modal open={open} onClose={close} title="Вход в MAZE ID">
      {step === "phone" ? (
        <form onSubmit={onSendCode} className="space-y-4">
          <p className="text-sm text-muted">
            Введите номер телефона — отправим SMS-код для входа в MAZE ID.
          </p>
          <PhoneNationalField
            id="auth-phone"
            value={phoneNational}
            onChange={(next) => {
              setPhoneNational(next);
              setForcePhoneError(false);
              setError(null);
            }}
            disabled={pending}
            autoFocus={open}
            forceError={forcePhoneError}
          />
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 text-sm text-ink"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!canSubmitPhone}
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
          <OtpCodeInput
            value={code}
            onChange={(next) => {
              setCode(next);
              setError(null);
            }}
            disabled={pending}
            autoFocus={open}
          />
          {devCode ? (
            <p className="text-xs text-cyan">
              Код для разработки:{" "}
              <span className="font-mono tracking-widest">{devCode}</span>
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 text-sm text-ink"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!canSubmitCode}
          >
            {pending ? "Проверяем…" : "Войти"}
          </button>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={goBackToPhone}
              className="w-full text-center text-xs text-muted transition-colors hover:text-ink cursor-pointer disabled:opacity-40"
              disabled={pending}
            >
              Изменить номер
            </button>
            <button
              type="button"
              onClick={() => void onResend()}
              className="w-full text-center text-xs text-muted transition-colors hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canResend}
            >
              {resendIn > 0
                ? `Отправить повторно через ${resendIn} сек.`
                : "Отправить код повторно"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
