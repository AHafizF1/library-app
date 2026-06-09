import { describe, expect, test } from "vitest";
import { bookCoverSchema, mapCoverResultToDraft } from "./analyze-cover";

describe("bookCoverSchema", () => {
  test("validates a full AI response", () => {
    const input = {
      title: { en: "The Beginning and the End", ar: "البداية والنهاية" },
      author: { en: "Ibn Kathir", ar: "ابن كثير" },
      publisher: { ar: "دار الفكر" },
      edition: "2nd",
      bookType: "multi-volume" as const,
      expectedVolumeCount: 14,
    };
    expect(bookCoverSchema.parse(input)).toMatchObject(input);
  });

  test("validates a minimal AI response (all optional)", () => {
    const input = { title: {}, author: {} };
    expect(() => bookCoverSchema.parse(input)).not.toThrow();
  });

  test("rejects invalid bookType", () => {
    const input = { title: {}, author: {}, bookType: "hardcover" };
    expect(() => bookCoverSchema.parse(input)).toThrow();
  });
});

describe("mapCoverResultToDraft", () => {
  test("maps a full AI response to BookDraft fields", () => {
    const result = mapCoverResultToDraft({
      title: { en: "Siyar", ar: "سير أعلام النبلاء", am: "ሲያር" },
      author: { en: "Al-Dhahabi", ar: "الذهبي" },
      publisher: { ar: "مؤسسة الرسالة" },
      edition: "1st",
      bookType: "multi-volume",
      expectedVolumeCount: 25,
    });
    expect(result.titleEnglish).toBe("Siyar");
    expect(result.titleArabic).toBe("سير أعلام النبلاء");
    expect(result.titleAmharic).toBe("ሲያር");
    expect(result.authorEnglish).toBe("Al-Dhahabi");
    expect(result.authorArabic).toBe("الذهبي");
    expect(result.publisher).toBe("مؤسسة الرسالة");
    expect(result.bookType).toBe("multi-volume");
    expect(result.expectedVolumeCount).toBe(25);
  });

  test("handles empty/partial AI response gracefully", () => {
    const result = mapCoverResultToDraft({ title: {}, author: {} });
    expect(result.titleEnglish).toBe("");
    expect(result.titleArabic).toBe("");
    expect(result.authorEnglish).toBe("");
  });
});
