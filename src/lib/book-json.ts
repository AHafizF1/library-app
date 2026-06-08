export type BookDraft = {
  titleEnglish: string;
  titleArabic: string;
  authorEnglish: string;
  authorArabic: string;
  publisher: string;
  isbn: string;
  edition: string;
  bookType: "single" | "multi-volume";
  expectedVolumeCount?: number;
  visibleVolumes?: number[];
  column: string;
  row: string;
  notes: string;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const num = (value: unknown) => (typeof value === "number" ? value : undefined);
const numArray = (value: unknown) => (Array.isArray(value) ? value.filter(v => typeof v === "number") : undefined);

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
    edition: text(value.edition),
    bookType: text(value.bookType) === "multi-volume" ? "multi-volume" : "single",
    expectedVolumeCount: num(value.expectedVolumeCount),
    visibleVolumes: numArray(value.visibleVolumes),
    column: text(value.column),
    row: text(value.row),
    notes: text(value.notes),
  };
}
