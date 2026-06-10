"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function LibraryPage() {
  const organization = useQuery(api.organizations.current);
  const books = useQuery(api.books.list, organization ? { organizationId: organization.id } : "skip");
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const updateBook = useMutation(api.books.update);

  // Handle auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (organization === undefined || books === undefined) {
    return <p className="py-24 text-center text-sm text-stone-500">Opening catalogue...</p>;
  }

  if (!organization) {
    return <p className="py-24 text-center">No organization membership found.</p>;
  }

  const canEdit = organization.role === "owner" || organization.role === "admin";

  // Find other copies or volumes of the same work in memory
  const getCompanionVolumes = (currentBook: any) => {
    if (!books) return [];
    const parentId = currentBook.parentBookId || currentBook.id;
    return books.filter((b) => 
      (b.id === parentId || b.parentBookId === parentId) && b.id !== currentBook.id
    );
  };

  const startEditing = () => {
    setEditForm({
      titleEnglish: selectedBook.titleEnglish || "",
      titleArabic: selectedBook.titleArabic || "",
      titleAmharic: selectedBook.titleAmharic || "",
      authorEnglish: selectedBook.authorEnglish || "",
      authorArabic: selectedBook.authorArabic || "",
      authorAmharic: selectedBook.authorAmharic || "",
      publisher: selectedBook.publisher || "",
      publisherAmharic: selectedBook.publisherAmharic || "",
      isbn: selectedBook.isbn || "",
      edition: selectedBook.edition || "",
      bookType: selectedBook.bookType || "single",
      volumeStart: selectedBook.volumeStart !== undefined ? selectedBook.volumeStart : "",
      volumeEnd: selectedBook.volumeEnd !== undefined ? selectedBook.volumeEnd : "",
      copyCount: selectedBook.copyCount !== undefined ? selectedBook.copyCount : 1,
      physicalVolumeCount: selectedBook.physicalVolumeCount !== undefined ? selectedBook.physicalVolumeCount : 1,
      column: selectedBook.column || "",
      row: selectedBook.row || "",
      notes: selectedBook.notes || "",
    });
    setIsEditing(true);
  };

  const checkIsDirty = (form: any, book: any) => {
    if (!book) return false;
    const fields = [
      "titleEnglish", "titleArabic", "titleAmharic",
      "authorEnglish", "authorArabic", "authorAmharic",
      "publisher", "publisherAmharic", "isbn", "edition",
      "bookType", "volumeStart", "volumeEnd", "copyCount",
      "physicalVolumeCount", "column", "row", "notes"
    ];
    return fields.some((field) => {
      let formVal = form[field];
      let bookVal = book[field];

      if (formVal === "") formVal = undefined;
      if (bookVal === "") bookVal = undefined;
      if (bookVal === null) bookVal = undefined;

      if (["volumeStart", "volumeEnd", "copyCount", "physicalVolumeCount"].includes(field)) {
        const fNum = formVal !== undefined && formVal !== "" ? Number(formVal) : undefined;
        const bNum = bookVal !== undefined && bookVal !== "" ? Number(bookVal) : undefined;
        return fNum !== bNum;
      }

      return formVal !== bookVal;
    });
  };

  const attemptClose = () => {
    if (isEditing && checkIsDirty(editForm, selectedBook)) {
      setShowDiscardConfirm(true);
    } else {
      setSelectedBook(null);
      setIsEditing(false);
      setShowDiscardConfirm(false);
    }
  };

  const attemptCancel = () => {
    if (isEditing && checkIsDirty(editForm, selectedBook)) {
      setShowDiscardConfirm(true);
    } else {
      setIsEditing(false);
      setShowDiscardConfirm(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSaving(true);
    try {
      const orgId = organization.id;
      const bookId = selectedBook.id;

      if (!selectedBook.parentBookId && !editForm.titleEnglish?.trim() && !editForm.titleArabic?.trim() && !editForm.titleAmharic?.trim()) {
        alert("At least one title (English, Arabic, or Amharic) is required.");
        setIsSaving(false);
        return;
      }

      await updateBook({
        id: bookId,
        organizationId: orgId,
        titleEnglish: editForm.titleEnglish,
        titleArabic: editForm.titleArabic,
        titleAmharic: editForm.titleAmharic,
        authorEnglish: editForm.authorEnglish,
        authorArabic: editForm.authorArabic,
        authorAmharic: editForm.authorAmharic,
        publisher: editForm.publisher,
        publisherAmharic: editForm.publisherAmharic,
        isbn: editForm.isbn,
        edition: editForm.edition,
        bookType: editForm.bookType,
        volumeStart: editForm.bookType === "multi-volume" && editForm.volumeStart !== "" ? Number(editForm.volumeStart) : undefined,
        volumeEnd: editForm.bookType === "multi-volume" && editForm.volumeEnd !== "" ? Number(editForm.volumeEnd) : undefined,
        copyCount: editForm.copyCount !== "" ? Number(editForm.copyCount) : 1,
        physicalVolumeCount: editForm.physicalVolumeCount !== "" ? Number(editForm.physicalVolumeCount) : 1,
        column: editForm.column,
        row: editForm.row,
        notes: editForm.notes,
        coverStorageId: selectedBook.coverStorageId || undefined,
        parentBookId: selectedBook.parentBookId || undefined,
      });

      setToastMessage("Changes saved successfully");
      setIsEditing(false);

      setSelectedBook({
        ...selectedBook,
        titleEnglish: editForm.titleEnglish?.trim() || undefined,
        titleArabic: editForm.titleArabic?.trim() || undefined,
        titleAmharic: editForm.titleAmharic?.trim() || undefined,
        authorEnglish: editForm.authorEnglish?.trim() || undefined,
        authorArabic: editForm.authorArabic?.trim() || undefined,
        authorAmharic: editForm.authorAmharic?.trim() || undefined,
        publisher: editForm.publisher?.trim() || undefined,
        publisherAmharic: editForm.publisherAmharic?.trim() || undefined,
        isbn: editForm.isbn?.trim() || undefined,
        edition: editForm.edition?.trim() || undefined,
        bookType: editForm.bookType,
        volumeStart: editForm.bookType === "multi-volume" && editForm.volumeStart !== "" ? Number(editForm.volumeStart) : undefined,
        volumeEnd: editForm.bookType === "multi-volume" && editForm.volumeEnd !== "" ? Number(editForm.volumeEnd) : undefined,
        copyCount: editForm.copyCount !== "" ? Number(editForm.copyCount) : 1,
        physicalVolumeCount: editForm.physicalVolumeCount !== "" ? Number(editForm.physicalVolumeCount) : 1,
        column: editForm.column?.trim() || undefined,
        row: editForm.row?.trim() || undefined,
        notes: editForm.notes?.trim() || undefined,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update book.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 py-8">
          {books.map((book) => {
            const displayTitle = book.titleAmharic || book.titleEnglish || book.titleArabic || "Untitled";
            const displayAuthor = book.authorAmharic || book.authorEnglish || book.authorArabic || "Unknown Author";
            
            return (
              <article 
                key={book.id} 
                onClick={() => {
                  setSelectedBook(book);
                  setIsEditing(false);
                  setShowDiscardConfirm(false);
                }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#d9cfbf]/55 bg-[#fffdf8]/65 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5 hover:bg-[#fffdf8]/85 cursor-pointer p-2.5"
              >
                <div>
                  <div className="aspect-[2/3] w-full bg-[#e9e0d1] bg-cover bg-center rounded-lg overflow-hidden shadow-xs relative" style={book.coverUrl ? { backgroundImage: `url("${book.coverUrl}")` } : undefined}>
                    {!book.coverUrl && (
                      <div className="flex h-full items-center justify-center text-[#a99472]">
                        <span className="font-serif text-3xl">Aa</span>
                      </div>
                    )}
                    
                    {/* Location overlay badge on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs py-1 text-center text-[9px] uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {book.column && book.row ? `${book.column}-${book.row}` : "No Location"}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {/* Main title */}
                    <h2 className="text-xs font-bold leading-tight text-stone-900 line-clamp-2" lang="am">
                      {displayTitle}
                    </h2>
                    
                    {/* Subtitle if bilingual */}
                    {book.titleAmharic && book.titleEnglish && (
                      <h3 className="font-serif text-[10px] text-stone-500 line-clamp-1 italic">
                        {book.titleEnglish}
                      </h3>
                    )}

                    <p className="text-[10px] text-stone-500 line-clamp-1 pt-1">
                      {displayAuthor}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#d9cfbf]/40 pt-2 text-[9px] uppercase tracking-wider text-stone-400 font-semibold">
                  <span>
                    {book.bookType === "multi-volume" && book.volumeStart !== undefined
                      ? `Vol. ${book.volumeStart}`
                      : "Single"}
                  </span>
                  {book.copyCount && book.copyCount > 1 && (
                    <span className="rounded bg-[#26352f]/10 px-1.5 py-0.5 text-[#26352f] text-[8px] font-bold">
                      {book.copyCount}x
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Slide-over Details Drawer */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs transition-opacity duration-300">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={attemptClose} />
          
          {/* Panel */}
          <div className="relative w-full max-w-lg h-full bg-[#fffdf8] border-l border-[#d9cfbf] p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between">
            {/* Unsaved Changes Confirmation Modal (within panel) */}
            {showDiscardConfirm && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs p-6 animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-2xl border border-[#d9cfbf] bg-[#fffdf8] p-6 shadow-xl animate-in zoom-in-95 duration-200">
                  <h4 className="font-serif text-xl text-[#26352f] font-bold">Discard Changes?</h4>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    You have modified this book's details. If you leave now, all your changes will be discarded.
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                      onClick={() => setShowDiscardConfirm(false)}
                      className="rounded-xl border border-[#d9cfbf] bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      Keep Editing
                    </button>
                    <button
                      onClick={() => {
                        setShowDiscardConfirm(false);
                        setIsEditing(false);
                        setSelectedBook(null);
                      }}
                      className="rounded-xl bg-red-700 text-white px-4 py-2.5 text-xs font-semibold hover:bg-red-800 transition-colors"
                    >
                      Discard Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#d9cfbf] pb-4">
                <h3 className="font-serif text-2xl text-[#26352f]">
                  {isEditing ? "Edit Book Details" : "Book Details"}
                </h3>
                <div className="flex items-center gap-2">
                  {canEdit && !isEditing && (
                    <button
                      onClick={startEditing}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9cfbf] bg-white px-3 py-1.5 text-xs font-semibold text-[#26352f] hover:bg-stone-50 transition-all shadow-xs"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Book
                    </button>
                  )}
                  <button onClick={attemptClose} className="rounded-lg p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <>
                  {/* Cover & High-level details */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-44 aspect-[2/3] bg-[#e9e0d1] rounded-xl border border-[#d9cfbf] overflow-hidden bg-cover bg-center shadow-md shrink-0" style={selectedBook.coverUrl ? { backgroundImage: `url("${selectedBook.coverUrl}")` } : undefined}>
                      {!selectedBook.coverUrl && <div className="flex h-full items-center justify-center text-[#a99472]"><span className="font-serif text-5xl">Aa</span></div>}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94691f]">Titles</span>
                        {selectedBook.titleAmharic && <h2 lang="am" className="text-lg font-bold leading-snug mt-1 text-stone-900">{selectedBook.titleAmharic}</h2>}
                        {selectedBook.titleArabic && <h2 dir="rtl" lang="ar" className="text-right text-lg font-bold leading-snug mt-1 text-stone-900">{selectedBook.titleArabic}</h2>}
                        {selectedBook.titleEnglish && <h3 className="font-serif text-base text-stone-600 mt-1">{selectedBook.titleEnglish}</h3>}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94691f]">Authors</span>
                        <p className="text-sm font-semibold text-stone-800 mt-0.5">
                          {selectedBook.authorAmharic || selectedBook.authorArabic || selectedBook.authorEnglish || "Unknown Author"}
                        </p>
                        {selectedBook.authorEnglish && selectedBook.authorAmharic && (
                          <p className="text-xs text-stone-400 mt-0.5">English: {selectedBook.authorEnglish}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata details sections */}
                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#d9cfbf] pt-6">
                    <div className="rounded-xl border border-[#d9cfbf]/60 bg-[#fffdf8]/60 p-3 shadow-xs">
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#94691f] block">Physical Location</span>
                      <span className="text-sm font-bold text-[#26352f] block mt-1">
                        Column {selectedBook.column || "—"}
                      </span>
                      <span className="text-xs text-stone-500 block mt-0.5">
                        Row {selectedBook.row || "—"}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#d9cfbf]/60 bg-[#fffdf8]/60 p-3 shadow-xs">
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#94691f] block">Holdings & Copy Info</span>
                      <span className="text-sm font-bold text-[#26352f] block mt-1">
                        {selectedBook.copyCount ?? 1} {selectedBook.copyCount === 1 ? "Copy" : "Copies"}
                      </span>
                      <span className="text-xs text-stone-500 block mt-0.5">
                        {selectedBook.bookType === "multi-volume" 
                          ? `Vols: ${selectedBook.volumeStart ?? 1}–${selectedBook.volumeEnd ?? 1}` 
                          : "Single Volume"}
                      </span>
                    </div>
                  </div>

                  {/* Companion copies/volumes from memory */}
                  {(() => {
                    const companions = getCompanionVolumes(selectedBook);
                    if (companions.length === 0) return null;
                    return (
                      <div className="mt-6 border-t border-[#d9cfbf] pt-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400 block">Companion Copies / Volumes</span>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {companions.map((comp) => (
                            <button
                              key={comp.id}
                              onClick={() => {
                                setSelectedBook(comp);
                                setIsEditing(false);
                                setShowDiscardConfirm(false);
                              }}
                              className="flex items-center gap-2 rounded-lg border border-[#d9cfbf]/65 bg-[#fffdf8] px-2.5 py-1.5 text-xs text-stone-700 hover:bg-[#26352f] hover:text-white hover:border-transparent transition-all shadow-xs"
                            >
                              <span className="font-semibold">{comp.column && comp.row ? `${comp.column}-${comp.row}` : "Set"}</span>
                              {comp.volumeStart !== undefined && (
                                <span className="opacity-60">V.{comp.volumeStart}</span>
                              )}
                              {comp.copyCount > 1 && (
                                <span className="bg-[#26352f]/10 text-[#26352f] group-hover:bg-white/20 group-hover:text-white px-1 rounded-sm text-[9px] font-bold">
                                  {comp.copyCount}x
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Extra specifications */}
                  <div className="mt-6 space-y-4 border-t border-[#d9cfbf] pt-6">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">Publication Details</h4>
                      <div className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-stone-600">
                        <div><span className="text-stone-400 mr-1">Publisher:</span> {selectedBook.publisher || "—"}</div>
                        {selectedBook.publisherAmharic && <div><span className="text-stone-400 mr-1">Pub (AM):</span> {selectedBook.publisherAmharic}</div>}
                        <div><span className="text-stone-400 mr-1">Edition:</span> {selectedBook.edition || "—"}</div>
                        <div><span className="text-stone-400 mr-1">ISBN:</span> {selectedBook.isbn || "—"}</div>
                      </div>
                    </div>

                    {selectedBook.notes && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400">Notes</h4>
                        <p className="mt-2 text-xs leading-relaxed text-stone-600 bg-stone-100/60 p-3 rounded-lg border border-[#d9cfbf]/30">
                          {selectedBook.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <form id="edit-book-form" onSubmit={handleSave} className="mt-6 space-y-5 pb-6">
                  {/* English Title */}
                  <div className="space-y-1.5">
                    <label htmlFor="titleEnglish" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Title (English)</label>
                    <input
                      type="text"
                      id="titleEnglish"
                      value={editForm.titleEnglish || ""}
                      onChange={(e) => setEditForm({ ...editForm, titleEnglish: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    />
                  </div>

                  {/* Arabic Title */}
                  <div className="space-y-1.5">
                    <label htmlFor="titleArabic" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Title (Arabic)</label>
                    <input
                      type="text"
                      id="titleArabic"
                      dir="rtl"
                      value={editForm.titleArabic || ""}
                      onChange={(e) => setEditForm({ ...editForm, titleArabic: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] text-right transition-all"
                    />
                  </div>

                  {/* Amharic Title */}
                  <div className="space-y-1.5">
                    <label htmlFor="titleAmharic" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Title (Amharic)</label>
                    <input
                      type="text"
                      id="titleAmharic"
                      value={editForm.titleAmharic || ""}
                      onChange={(e) => setEditForm({ ...editForm, titleAmharic: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    />
                  </div>

                  {/* English Author */}
                  <div className="space-y-1.5">
                    <label htmlFor="authorEnglish" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Author (English)</label>
                    <input
                      type="text"
                      id="authorEnglish"
                      value={editForm.authorEnglish || ""}
                      onChange={(e) => setEditForm({ ...editForm, authorEnglish: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    />
                  </div>

                  {/* Arabic Author */}
                  <div className="space-y-1.5">
                    <label htmlFor="authorArabic" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Author (Arabic)</label>
                    <input
                      type="text"
                      id="authorArabic"
                      dir="rtl"
                      value={editForm.authorArabic || ""}
                      onChange={(e) => setEditForm({ ...editForm, authorArabic: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] text-right transition-all"
                    />
                  </div>

                  {/* Amharic Author */}
                  <div className="space-y-1.5">
                    <label htmlFor="authorAmharic" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Author (Amharic)</label>
                    <input
                      type="text"
                      id="authorAmharic"
                      value={editForm.authorAmharic || ""}
                      onChange={(e) => setEditForm({ ...editForm, authorAmharic: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    />
                  </div>

                  {/* Publisher English */}
                  <div className="space-y-1.5">
                    <label htmlFor="publisher" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Publisher (English)</label>
                    <input
                      type="text"
                      id="publisher"
                      value={editForm.publisher || ""}
                      onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    />
                  </div>

                  {/* Publisher Amharic */}
                  <div className="space-y-1.5">
                    <label htmlFor="publisherAmharic" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Publisher (Amharic)</label>
                    <input
                      type="text"
                      id="publisherAmharic"
                      value={editForm.publisherAmharic || ""}
                      onChange={(e) => setEditForm({ ...editForm, publisherAmharic: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    />
                  </div>

                  {/* Edition & ISBN side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="edition" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Edition</label>
                      <input
                        type="text"
                        id="edition"
                        value={editForm.edition || ""}
                        onChange={(e) => setEditForm({ ...editForm, edition: e.target.value })}
                        className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="isbn" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">ISBN</label>
                      <input
                        type="text"
                        id="isbn"
                        value={editForm.isbn || ""}
                        onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                        className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                      />
                    </div>
                  </div>

                  {/* Book Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="bookType" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Book Type</label>
                    <select
                      id="bookType"
                      value={editForm.bookType || "single"}
                      onChange={(e) => setEditForm({ ...editForm, bookType: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-[#fffdf8] px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                    >
                      <option value="single">Single Volume</option>
                      <option value="multi-volume">Multi-volume Work</option>
                    </select>
                  </div>

                  {/* Volume Start & End */}
                  {editForm.bookType === "multi-volume" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label htmlFor="volumeStart" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Volume Start</label>
                        <input
                          type="number"
                          id="volumeStart"
                          value={editForm.volumeStart !== undefined ? editForm.volumeStart : ""}
                          onChange={(e) => setEditForm({ ...editForm, volumeStart: e.target.value })}
                          className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="volumeEnd" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Volume End</label>
                        <input
                          type="number"
                          id="volumeEnd"
                          value={editForm.volumeEnd !== undefined ? editForm.volumeEnd : ""}
                          onChange={(e) => setEditForm({ ...editForm, volumeEnd: e.target.value })}
                          className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Copy Count & Physical Volume Count */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="copyCount" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Copy Count</label>
                      <input
                        type="number"
                        id="copyCount"
                        value={editForm.copyCount !== undefined ? editForm.copyCount : 1}
                        onChange={(e) => setEditForm({ ...editForm, copyCount: e.target.value })}
                        className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="physicalVolumeCount" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Physical Volumes</label>
                      <input
                        type="number"
                        id="physicalVolumeCount"
                        value={editForm.physicalVolumeCount !== undefined ? editForm.physicalVolumeCount : 1}
                        onChange={(e) => setEditForm({ ...editForm, physicalVolumeCount: e.target.value })}
                        className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                      />
                    </div>
                  </div>

                  {/* Coordinates: Column & Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="column" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Column</label>
                      <input
                        type="text"
                        id="column"
                        placeholder="e.g. C22"
                        value={editForm.column || ""}
                        onChange={(e) => setEditForm({ ...editForm, column: e.target.value })}
                        className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="row" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Row</label>
                      <input
                        type="text"
                        id="row"
                        placeholder="e.g. R03"
                        value={editForm.row || ""}
                        onChange={(e) => setEditForm({ ...editForm, row: e.target.value })}
                        className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] transition-all"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#94691f]">Notes</label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={editForm.notes || ""}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className="w-full rounded-xl border border-[#d9cfbf] bg-white/70 backdrop-blur-xs px-4 py-2.5 text-sm text-stone-800 outline-none focus:border-[#94691f] focus:ring-1 focus:ring-[#94691f] resize-none transition-all"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-[#d9cfbf] pt-4 mt-6 flex justify-end gap-2 shrink-0 bg-[#fffdf8]">
              {!isEditing ? (
                <button 
                  onClick={attemptClose} 
                  className="rounded-xl border border-[#d9cfbf] bg-[#26352f] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#1a2620] transition-colors shadow-sm"
                >
                  Close Details
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={attemptCancel}
                    disabled={isSaving}
                    className="rounded-xl border border-[#d9cfbf] bg-white text-stone-700 px-5 py-2.5 text-xs font-semibold hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-book-form"
                    disabled={isSaving}
                    className="rounded-xl bg-[#26352f] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#1a2620] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#26352f]/10 bg-[#fffdf8]/90 backdrop-blur-md px-5 py-4 shadow-xl shadow-[#26352f]/5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#26352f]/10 text-[#26352f]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-stone-800">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 rounded-md p-1 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

