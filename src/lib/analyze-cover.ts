import { z } from "zod";
import { mapNestedToDraft, type BookDraft } from "./book-json";

/** Zod schema describing what the AI should return */
export const bookCoverSchema = z.object({
  title: z.object({
    en: z.string().describe("English title"),
    ar: z.string().describe("Arabic title"),
    am: z.string().describe("Amharic title"),
  }).partial(),
  author: z.object({
    en: z.string().describe("English author name"),
    ar: z.string().describe("Arabic author name"),
    am: z.string().describe("Amharic author name"),
  }).partial(),
  publisher: z.object({
    en: z.string().describe("English publisher"),
    ar: z.string().describe("Arabic publisher"),
    am: z.string().describe("Amharic publisher"),
  }).partial().optional(),
  edition: z.string().optional(),
  bookType: z.enum(["single", "multi-volume"]).optional(),
  expectedVolumeCount: z.number().optional(),
});

/** The type the AI returns */
export type BookCoverAnalysis = z.infer<typeof bookCoverSchema>;

/** The system prompt sent to the AI */
export const ANALYSIS_PROMPT = `You are an expert Arabic and Islamic book cataloguer.
Examine this book cover image and extract the following metadata.
- Prioritize reading Arabic calligraphic text accurately.
- If you can identify Amharic (Ethiopian) text, extract that too.
- Transliterate or translate titles and authors into English.
- If a field is not visible or you are unsure, leave it as an empty string.
- For multi-volume sets, identify the book type and volume count if visible.
Do NOT guess or hallucinate. Only extract what you can clearly read.`;

/** Maps the AI's structured response into our BookDraft shape */
export function mapCoverResultToDraft(
  result: BookCoverAnalysis
): Partial<BookDraft> {
  return mapNestedToDraft(result as Record<string, any>);
}
