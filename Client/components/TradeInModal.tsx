"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modals";
import { Field, fieldCls } from "./Field";
import { PhoneNationalField } from "./PhoneNationalField";
import { formatPrice } from "@/lib/utils";
import { isValidRussianMobile, validateRussianMobile } from "@/lib/phone";
import { Sparkles } from "lucide-react";

const CONDITIONS = [
  { label: "Отличное", factor: 1 },
  { label: "Хорошее", factor: 0.8 },
  { label: "Удовлетворительное", factor: 0.6 },
  { label: "С дефектами", factor: 0.4 },
];

export function TradeInModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "result">("form");
  const [device, setDevice] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0].label);
  const [phoneNational, setPhoneNational] = useState("");
  const [forcePhoneError, setForcePhoneError] = useState(false);
  const [target, setTarget] = useState(0);
  const [shown, setShown] = useState(0);

  // count-up анимация оценки
  useEffect(() => {
    if (step !== "result") return;
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, target]);

  function close() {
    onClose();
    setTimeout(() => {
      setStep("form");
      setDevice("");
      setPhoneNational("");
      setForcePhoneError(false);
      setShown(0);
    }, 250);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const phoneCheck = validateRussianMobile(phoneNational);
    if (!phoneCheck.ok) {
      setForcePhoneError(true);
      return;
    }
    setForcePhoneError(false);
    const factor =
      CONDITIONS.find((c) => c.label === condition)?.factor ?? 0.8;
    const base = 18000 + Math.floor(Math.random() * 62000);
    setTarget(Math.round((base * factor) / 100) * 100);
    setStep("result");
  }

  const phoneValid = isValidRussianMobile(phoneNational);

  return (
    <Modal open={open} onClose={close} title="Рассчитать трейд-ин">
      {step === "form" ? (
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Ваше устройство"
            required
            placeholder="iPhone 13 Pro 128GB"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="cond"
              className="block text-xs font-medium uppercase tracking-wider text-muted"
            >
              Состояние
            </label>
            <select
              id="cond"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={`${fieldCls} cursor-pointer appearance-none`}
            >
              {CONDITIONS.map((c) => (
                <option key={c.label} value={c.label} className="bg-panel">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <PhoneNationalField
            id="tradein-phone"
            value={phoneNational}
            onChange={(next) => {
              setPhoneNational(next);
              setForcePhoneError(false);
            }}
            forceError={forcePhoneError}
          />
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!device.trim() || !phoneValid}
          >
            Получить оценку
          </button>
        </form>
      ) : (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan/15 text-cyan">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-sm text-muted">
              Оценка{device ? ` «${device}»` : ""}:
            </p>
            <p className="font-display text-4xl font-bold text-iri tabular-nums">
              {formatPrice(shown)}
            </p>
            <p className="mt-1 text-xs text-faint">
              Скидка на новое устройство при обмене
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep("form")}
              className="btn-ghost flex-1"
            >
              Другое
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                router.push("/catalog");
              }}
              className="btn-primary flex-1"
            >
              В каталог
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
