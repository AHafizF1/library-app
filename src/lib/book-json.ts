export type BookDraft = {
  titleEnglish: string;
  titleArabic: string;
  titleAmharic: string;
  authorEnglish: string;
  authorArabic: string;
  authorAmharic: string;
  publisher: string;
  publisherAmharic: string;
  isbn: string;
  edition: string;
  bookType: "single" | "multi-volume";
  expectedVolumeCount?: number;
  visibleVolumes?: number[];
  copyCount?: number;
  physicalVolumeCount?: number;
  column: string;
  row: string;
  notes: string;
};

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const num = (value: unknown) => (typeof value === "number" ? value : undefined);
const numArray = (value: unknown) => (Array.isArray(value) ? value.filter(v => typeof v === "number") : undefined);

export function parseBookJson(source: string): Partial<BookDraft> {
  let trimmed = source.trim();
  if (!trimmed) return {};

  // Remove markdown code blocks if present (e.g. from LLM output)
  trimmed = trimmed.replace(/^```(?:json|javascript|js)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // If there are multiple sequential objects (e.g. `{...} {...}`), try to format them as an array
  if (trimmed.match(/}\s*\{/)) {
    trimmed = `[${trimmed.replace(/\}\s*\{/g, "},{")}]`;
  }

  let value: any;
  try {
    value = JSON.parse(trimmed);
  } catch {
    try {
      // Relaxed parsing for trailing commas, single quotes, unquoted keys, etc.
      value = new Function("return " + trimmed)();
    } catch {
      // If it STILL fails, attempt to extract just the first balanced {...} block
      const firstBrace = trimmed.indexOf('{');
      if (firstBrace !== -1) {
        let depth = 0;
        let lastBrace = -1;
        for (let i = firstBrace; i < trimmed.length; i++) {
          if (trimmed[i] === '{') depth++;
          if (trimmed[i] === '}') {
            depth--;
            if (depth === 0) {
              lastBrace = i;
              break;
            }
          }
        }
        if (lastBrace !== -1) {
          const firstBlock = trimmed.substring(firstBrace, lastBrace + 1);
          try {
            value = new Function("return " + firstBlock)();
          } catch {
            throw new Error("Invalid JSON or object format. Please check your syntax.");
          }
        } else {
          throw new Error("Invalid JSON or object format. Please check your syntax.");
        }
      } else {
        throw new Error("Invalid JSON or object format. Please check your syntax.");
      }
    }
  }

  if (Array.isArray(value)) {
    value = value[0];
  }
  if (!value || typeof value !== "object") {
    throw new Error("JSON must be an object.");
  }

  const title = (value.title ?? {}) as Record<string, unknown>;
  const author = (value.author ?? {}) as Record<string, unknown>;
  const publisherRaw = (value.publisher ?? {}) as Record<string, unknown>;

  return {
    titleEnglish: text(value.titleEnglish) || text(title.en),
    titleArabic: text(value.titleArabic) || text(title.ar),
    titleAmharic: text(value.titleAmharic) || text(title.am),
    authorEnglish: text(value.authorEnglish) || text(author.en),
    authorArabic: text(value.authorArabic) || text(author.ar),
    authorAmharic: text(value.authorAmharic) || text(author.am),
    publisher: text(value.publisher) || text(publisherRaw.ar) || text(publisherRaw.en),
    publisherAmharic: text(value.publisherAmharic) || text(publisherRaw.am),
    isbn: text(value.isbn),
    edition: text(value.edition),
    bookType: text(value.bookType) === "multi-volume" ? "multi-volume" : "single",
    expectedVolumeCount: num(value.expectedVolumeCount),
    visibleVolumes: numArray(value.visibleVolumes),
    copyCount: num(value.copyCount),
    physicalVolumeCount: num(value.physicalVolumeCount),
    column: text(value.column),
    row: text(value.row),
    notes: text(value.notes),
  };
}
