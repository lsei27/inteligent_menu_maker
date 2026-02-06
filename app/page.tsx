import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-b from-slate-50 to-white p-8">
      <h1 className="text-3xl font-bold text-slate-800">
        Generátor menu
      </h1>
      <p className="max-w-md text-center text-slate-600">
        Inteligentní generování týdenního poledního menu na základě počasí,
        historie a pravidel pro vyvážené menu.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/generate"
          className="rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-700"
        >
          Vygenerovat menu na příští týden
        </Link>
        <Link
          href="/history"
          className="rounded-xl border-2 border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 hover:bg-slate-50"
        >
          Historie menu
        </Link>
      </div>
    </main>
  );
}
