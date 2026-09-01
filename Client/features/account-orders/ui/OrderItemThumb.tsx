"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";

type OrderItemThumbProps = {
  image: string | null;
  name: string;
  className?: string;
};

/** Мини-превью позиции заказа — те же URL/прокси, что у карточек каталога. */
export function OrderItemThumb({ image, name, className }: OrderItemThumbProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveMediaUrl(image);
  const showPhoto = Boolean(src) && !failed;

  if (!showPhoto) {
    return (
      <div
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan/20 to-violet/20 text-xs font-semibold text-ink/80",
          className,
        )}
        aria-hidden
      >
        {name.trim().charAt(0) || "?"}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-white/5",
        className,
      )}
    >
      <Image
        src={src!}
        alt={name}
        fill
        className="object-contain p-1"
        sizes="80px"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
