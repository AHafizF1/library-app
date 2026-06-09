"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { BookDraft, parseBookJson } from "@/lib/book-json";
import { useAnalyzeCover } from "@/hooks/useAnalyzeCover";
import type { Id } from "../../../../../convex/_generated/dataModel";

const emptyBook: BookDraft = {
  titleEnglish: "", titleArabic: "", titleAmharic: "", 
  authorEnglish: "", authorArabic: "", authorAmharic: "",
  publisher: "", publisherAmharic: "", isbn: "", edition: "", 
  bookType: "single", expectedVolumeCount: undefined,
  visibleVolumes: [], copyCount: undefined, physicalVolumeCount: undefined, 
  column: "", row: "", notes: "",
};

export default function AddBookPage() {
  const organization = useQuery(api.organizations.current);
  const createBook = useMutation(api.books.create);
  const generateUploadUrl = useMutation(api.books.generateUploadUrl);
  const [book, setBook] = useState(emptyBook);
  const [json, setJson] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const { state: analysisState, analyze, reset: resetAnalysis } = useAnalyzeCover();

  // When analysis completes, merge the draft into the form
  useEffect(() => {
    if (analysisState.status === "done") {
      setBook((current) => ({ ...current, ...analysisState.draft }));
      setMessage("AI analysis complete — review the fields below.");
      setError("");
    } else if (analysisState.status === "error") {
      setError(analysisState.message);
    }
  }, [analysisState]);

  const field = <K extends keyof BookDraft>(name: K, value: BookDraft[K]) => setBook((current) => ({ ...current, [name]: value }));

  function importJson() {
    try {
      setBook((current) => ({ ...current, ...parseBookJson(json) }));
      setError("");
      setMessage("JSON details loaded. Review, then save.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid JSON");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!organization) return;
    setSaving(true);
    setError("");
    try {
      let coverStorageId: Id<"_storage"> | undefined;
      if (cover) {
        if (!cover.type.startsWith("image/") || cover.size > 10 * 1024 * 1024) throw new Error("Cover must be an image smaller than 10 MB.");
        const uploadUrl = await generateUploadUrl({ organizationId: organization.id });
        const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": cover.type }, body: cover });
        if (!response.ok) throw new Error("Cover upload failed.");
        coverStorageId = (await response.json()).storageId as Id<"_storage">;
      }
      await createBook({ organizationId: organization.id, ...book, coverStorageId });
      setBook(emptyBook);
      setJson("");
      setCover(null);
      setMessage("Book saved. Ready for next one.");
      titleRef.current?.focus();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Book could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex items-end justify-between border-b border-[#d9cfbf] pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94691f]">Rapid entry</p>
          <h1 className="mt-2 font-serif text-4xl">Add books</h1>
          <p className="mt-2 text-stone-600">Save, clear, repeat. No redirect between books.</p>
        </div>
        <Link href="/library" className="text-sm font-semibold text-[#72521f] underline underline-offset-4">View catalogue</Link>
      </header>

      <form onSubmit={submit} className="grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-[#d9cfbf] bg-[#fffdf8] p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field ref={titleRef} label="English title" value={book.titleEnglish} onChange={(v) => field("titleEnglish", v)} />
            <Field label="Arabic title" value={book.titleArabic} onChange={(v) => field("titleArabic", v)} rtl />
            <Field label="English author" value={book.authorEnglish} onChange={(v) => field("authorEnglish", v)} />
            <Field label="Arabic author" value={book.authorArabic} onChange={(v) => field("authorArabic", v)} rtl />
            <Field label="Publisher" value={book.publisher} onChange={(v) => field("publisher", v)} />
            <Field label="Edition" value={book.edition} onChange={(v) => field("edition", v)} />
          </div>
          
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold">Book Type</label>
              <select value={book.bookType} onChange={(e) => field("bookType", e.target.value as "single" | "multi-volume")} className="mt-2 w-full rounded-xl border border-[#cfc5b5] bg-white px-4 py-3 outline-none focus:border-[#94691f] focus:ring-4 focus:ring-[#d6a950]/15">
                <option value="single">Single Volume</option>
                <option value="multi-volume">Multi-volume</option>
              </select>
            </div>
            {book.bookType === "multi-volume" && (
              <div>
                <label className="block text-sm font-semibold">Expected Volume Count</label>
                <input type="number" min="1" value={book.expectedVolumeCount || ""} onChange={(e) => field("expectedVolumeCount", e.target.value ? parseInt(e.target.value) : undefined)} className="mt-2 w-full rounded-xl border border-[#cfc5b5] bg-white px-4 py-3 outline-none focus:border-[#94691f] focus:ring-4 focus:ring-[#d6a950]/15" />
              </div>
            )}
            <Field label="Visible Volumes (e.g. 1,2,3)" value={book.visibleVolumes?.join(", ") || ""} onChange={(v) => field("visibleVolumes", v.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)))} />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Column" value={book.column} onChange={(v) => field("column", v)} />
            <Field label="Row" value={book.row} onChange={(v) => field("row", v)} />
          </div>
          <label className="mt-5 block text-sm font-semibold">Notes</label>
          <textarea value={book.notes} onChange={(e) => field("notes", e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-[#cfc5b5] bg-white px-4 py-3 outline-none focus:border-[#94691f] focus:ring-4 focus:ring-[#d6a950]/15" />
          <label className="mt-5 block text-sm font-semibold">Book cover</label>
          <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-dashed border-[#c7b99f] bg-[#faf5ea] p-4 text-sm" />
          {cover && analysisState.status !== "analyzing" && (
            <button type="button" onClick={() => analyze(cover)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#26352f] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#1a2620]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Analyze cover with AI
            </button>
          )}
          {analysisState.status === "analyzing" && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#d6a950]/30 bg-[#fef8ee] p-4">
              <div className="relative h-5 w-5">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#d6a950]/30" />
                <div className="absolute inset-0.5 animate-spin rounded-full border-2 border-[#d6a950] border-t-transparent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#94691f]">Analyzing cover…</p>
                <p className="text-xs text-stone-500">Reading Arabic and English text from the image.</p>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl bg-[#26352f] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d9ad57]">JSON import</p>
            <p className="mt-2 text-sm leading-6 text-[#ced5d0]">Paste one book object. Nested or flat bilingual keys work.</p>
            <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={20} spellCheck={false} placeholder={`{
  "title": {
    "en": "Siyar A'lam al-Nubala",
    "ar": "سير أعلام النبلاء",
    "am": "ሲያር አዕላም አል-ኑባላ"
  },
  "author": {
    "en": "Shams al-Din al-Dhahabi",
    "ar": "شمس الدين الذهبي",
    "am": "ሻምስ አል-ዲን አል-ዳሃቢ"
  },
  "publisher": {
    "ar": "مؤسسة الرسالة",
    "am": "አሳታሚ"
  },
  "edition": "",
  "bookType": "multi-volume",
  "expectedVolumeCount": 25,
  "visibleVolumes": [1, 2, 3, 4, 5, 6],
  "copyCount": 1,
  "physicalVolumeCount": 6,
  "column": "A1",
  "row": "2",
  "notes": "Volumes 1–6 are visible in this image."
}`} className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 p-3 font-mono text-xs leading-5 text-white outline-none focus:border-[#d9ad57]" />
            <button type="button" onClick={importJson} className="mt-3 w-full rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">Load JSON</button>
          </section>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          <button disabled={saving} className="w-full rounded-xl bg-[#9a6318] px-5 py-4 font-semibold text-white shadow-lg transition hover:bg-[#805114] disabled:opacity-60">{saving ? "Saving..." : "Save and add another"}</button>
        </aside>
      </form>
    </div>
  );
}

import { forwardRef } from "react";
const Field = forwardRef<HTMLInputElement, { label: string; value: string; onChange: (value: string) => void; rtl?: boolean }>(
  function Field({ label, value, onChange, rtl }, ref) {
    return <div><label className="block text-sm font-semibold">{label}</label><input ref={ref} dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-[#cfc5b5] bg-white px-4 py-3 outline-none focus:border-[#94691f] focus:ring-4 focus:ring-[#d6a950]/15" /></div>;
  },
);
