import { describe, expect, test } from "vitest";
import { parseBookJson } from "./book-json";

describe("parseBookJson", () => {
  test("reads bilingual book details", () => {
    expect(
      parseBookJson('{"title":{"en":"The Book","ar":"الكتاب"},"author":{"en":"Author","ar":"المؤلف"}}'),
    ).toMatchObject({
      titleEnglish: "The Book",
      titleArabic: "الكتاب",
      authorEnglish: "Author",
      authorArabic: "المؤلف",
    });
  });

  test("accepts flat keys", () => {
    expect(parseBookJson('{"titleEnglish":"Book","authorArabic":"كاتب","isbn":"123"}')).toMatchObject({
      titleEnglish: "Book",
      authorArabic: "كاتب",
      isbn: "123",
    });
  });

  test("rejects invalid JSON", () => {
    expect(() => parseBookJson("{bad")).toThrow("Invalid JSON");
  });
});
