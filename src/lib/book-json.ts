export type BookDraft = {
  titleEnglish: string;
  titleArabic: string;
  authorEnglish: string;
  authorArabic: string;
  publisher: string;
  isbn: string;
  notes: string;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function parseBookJson(source: string): Partial<BookDraft> {
  let value: Record<string, unknown>;
  try {
    value = JSON.parse(source) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JSON");
  }

  const title = (value.title ?? {}) as Record<string, unknown>;
  const author = (value.author ?? {}) as Record<string, unknown>;

  return {
    titleEnglish: text(value.titleEnglish) || text(title.en),
    titleArabic: text(value.titleArabic) || text(title.ar),
    authorEnglish: text(value.authorEnglish) || text(author.en),
    authorArabic: text(value.authorArabic) || text(author.ar),
    publisher: text(value.publisher),
    isbn: text(value.isbn),
    notes: text(value.notes),
  };
}
