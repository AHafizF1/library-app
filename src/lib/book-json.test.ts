import { describe, expect, test } from "vitest";
import { parseBookJson, mapNestedToDraft } from "./book-json";

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

  test("parses single-volume book json correctly", () => {
    const json = JSON.stringify({
      "title": {
        "en": "Riyad al-Salihin",
        "ar": "رياض الصالحين"
      },
      "author": {
        "en": "Yahya ibn Sharaf al-Nawawi",
        "ar": "يحيى بن شرف النووي"
      },
      "publisher": "Dar al-Minhaj",
      "edition": "1st",
      "bookType": "single",
      "expectedVolumeCount": 1,
      "visibleVolumes": [1],
      "column": "A1",
      "row": "2",
      "notes": "Good condition."
    });

    const parsed = parseBookJson(json);
    
    expect(parsed.titleEnglish).toBe("Riyad al-Salihin");
    expect(parsed.titleArabic).toBe("رياض الصالحين");
    expect(parsed.authorEnglish).toBe("Yahya ibn Sharaf al-Nawawi");
    expect(parsed.authorArabic).toBe("يحيى بن شرف النووي");
    expect(parsed.publisher).toBe("Dar al-Minhaj");
    expect(parsed.edition).toBe("1st");
    expect(parsed.bookType).toBe("single");
    expect(parsed.expectedVolumeCount).toBe(1);
    expect(parsed.visibleVolumes).toEqual([1]);
    expect(parsed.column).toBe("A1");
    expect(parsed.row).toBe("2");
    expect(parsed.notes).toBe("Good condition.");
  });

  test("parses multi-volume book json correctly without column/row", () => {
    const json = JSON.stringify({
      "title": {
        "en": "Siyar A'lam al-Nubala",
        "ar": "سير أعلام النبلاء"
      },
      "author": {
        "en": "Shams al-Din al-Dhahabi",
        "ar": "شمس الدين الذهبي"
      },
      "publisher": "مؤسسة الرسالة",
      "edition": "",
      "bookType": "multi-volume",
      "expectedVolumeCount": 25,
      "visibleVolumes": [1, 2, 3, 4, 5, 6],
      "notes": "Volumes 1–6 are visible in this image."
    });

    const parsed = parseBookJson(json);

    expect(parsed.bookType).toBe("multi-volume");
    expect(parsed.expectedVolumeCount).toBe(25);
    expect(parsed.visibleVolumes).toEqual([1, 2, 3, 4, 5, 6]);
    expect(parsed.column).toBe("");
    expect(parsed.row).toBe("");
  });
});

describe("mapNestedToDraft", () => {
  test("maps nested title/author/publisher objects to flat fields", () => {
    const result = mapNestedToDraft({
      title: { en: "The Book", ar: "الكتاب", am: "መጽሐፍ" },
      author: { en: "Author", ar: "المؤلف", am: "ደራሲ" },
      publisher: { ar: "دار النشر", en: "Dar al-Nashr", am: "አሳታሚ" },
    });
    expect(result.titleEnglish).toBe("The Book");
    expect(result.titleArabic).toBe("الكتاب");
    expect(result.titleAmharic).toBe("መጽሐፍ");
    expect(result.authorEnglish).toBe("Author");
    expect(result.authorArabic).toBe("المؤلف");
    expect(result.authorAmharic).toBe("ደራሲ");
    expect(result.publisher).toBe("دار النشر");
    expect(result.publisherAmharic).toBe("አሳታሚ");
  });

  test("prefers flat keys over nested keys", () => {
    const result = mapNestedToDraft({
      titleEnglish: "Flat Title",
      title: { en: "Nested Title" },
    });
    expect(result.titleEnglish).toBe("Flat Title");
  });

  test("handles completely empty input", () => {
    const result = mapNestedToDraft({});
    expect(result.titleEnglish).toBe("");
    expect(result.titleArabic).toBe("");
    expect(result.authorEnglish).toBe("");
  });

  test("maps bookType and numeric fields", () => {
    const result = mapNestedToDraft({
      bookType: "multi-volume",
      expectedVolumeCount: 10,
      copyCount: 2,
      physicalVolumeCount: 5,
      visibleVolumes: [1, 2, 3],
    });
    expect(result.bookType).toBe("multi-volume");
    expect(result.expectedVolumeCount).toBe(10);
    expect(result.copyCount).toBe(2);
    expect(result.physicalVolumeCount).toBe(5);
    expect(result.visibleVolumes).toEqual([1, 2, 3]);
  });

  test("handles publisher as plain string (not nested)", () => {
    const result = mapNestedToDraft({ publisher: "Simple Publisher" });
    expect(result.publisher).toBe("Simple Publisher");
  });
});
