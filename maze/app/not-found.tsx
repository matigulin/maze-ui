import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-[clamp(5rem,20vw,12rem)] font-bold leading-none text-iri">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          Ты заблудился в лабиринте
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Такой страницы нет. Но выход всегда рядом — вернись на главную или
          загляни в каталог.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            На главную
          </Link>
          <Link href="/catalog" className="btn-ghost">
            В каталог
          </Link>
        </div>
      </div>
    </div>
  );
}
