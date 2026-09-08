"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-[clamp(3rem,12vw,6rem)] font-bold leading-none text-iri">
          Упс
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          Что-то пошло не так
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Страница не загрузилась. Можно попробовать ещё раз или вернуться на
          главную.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Повторить
          </button>
          <Link href="/" className="btn-ghost">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
