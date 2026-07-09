"use client";

import { useState } from "react";
import { Modal } from "./modals";
import { Field } from "./Field";
import { ShieldCheck } from "lucide-react";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");

  function close() {
    onClose();
    // сброс после закрытия
    setTimeout(() => {
      setStep("phone");
      setPhone("");
    }, 250);
  }

  return (
    <Modal open={open} onClose={close} title="Вход в MAZE ID">
      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("code");
          }}
          className="space-y-4"
        >
          <Field
            label="Телефон"
            type="tel"
            inputMode="tel"
            required
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full">
            Получить код
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-faint">
            <ShieldCheck size={13} className="text-cyan" />
            Демо-вход, введите любой номер
          </p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            close();
          }}
          className="space-y-4"
        >
          <Field
            label="Код из SMS"
            inputMode="numeric"
            maxLength={4}
            required
            placeholder="1234"
            autoFocus
            hint={`Код отправлен на ${phone || "ваш номер"} · демо: любые 4 цифры`}
          />
          <button type="submit" className="btn-primary w-full">
            Войти
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="w-full text-center text-xs text-muted transition-colors hover:text-ink cursor-pointer"
          >
            Изменить номер
          </button>
        </form>
      )}
    </Modal>
  );
}
