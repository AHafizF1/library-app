"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function LibraryPage() {
  const organization = useQuery(api.organizations.current);
  const books = useQuery(api.books.list, organization ? { organizationId: organization.id } : "skip");

  if (organization === undefined || books === undefined) {
    return <p className="py-24 text-center text-sm text-stone-500">Opening catalogue...</p>;
  }

  if (!organization) {
    return <p className="py-24 text-center">No organization membership found.</p>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-5 border-b border-[#d9cfbf] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94691f]">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-0.025em] sm:text-5xl">{organization.name}</h1>
          <p className="mt-3 text-stone-600">{books.length} {books.length === 1 ? "book" : "books"} catalogued</p>
        </div>
        <Link href="/library/new" className="inline-flex items-center justify-center rounded-xl bg-[#26352f] px-5 py-3 font-semibold text-white shadow-lg shadow-[#26352f]/10 transition hover:-translate-y-0.5">
          Add books
        </Link>
      </header>

      {books.length === 0 ? (
        <section className="mx-auto flex max-w-xl flex-col items-center py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-full border border-[#cdbb9c] bg-[#fffaf0] text-[#94691f]">
            <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            </svg>
          </div>
          <h2 className="mt-6 font-serif text-3xl">Your shelves are waiting</h2>
          <p className="mt-3 max-w-md leading-7 text-stone-600">Add first title manually or paste bilingual JSON. You can keep adding without returning here.</p>
          <Link href="/library/new" className="mt-7 rounded-xl bg-[#26352f] px-5 py-3 font-semibold text-white">Add first book</Link>
        </section>
      ) : (
        <section className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <article key={book.id} className="group overflow-hidden rounded-2xl border border-[#d9cfbf] bg-[#fffdf8] shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5">
              <div className="aspect-[16/10] bg-[#e9e0d1] bg-cover bg-center" style={book.coverUrl ? { backgroundImage: `url("${book.coverUrl}")` } : undefined}>
                {!book.coverUrl && <div className="flex h-full items-center justify-center text-[#a99472]"><span className="font-serif text-5xl">Aa</span></div>}
              </div>
              <div className="p-5">
                {book.titleArabic && <h2 dir="rtl" lang="ar" className="text-right text-xl font-semibold leading-8">{book.titleArabic}</h2>}
                {book.titleEnglish && <h3 className="mt-1 font-serif text-xl">{book.titleEnglish}</h3>}
                <p className="mt-3 text-sm text-stone-600">{book.authorArabic || book.authorEnglish || "Unknown author"}</p>
                {book.publisher && <p className="mt-1 text-xs uppercase tracking-[0.08em] text-stone-400">{book.publisher}</p>}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
