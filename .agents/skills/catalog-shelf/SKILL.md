---
name: catalog-shelf
description: Handles the manual transcription and database ingestion of a shelf row/column of books, accounting for duplicates and multi-volume splits.
---

# Catalog Shelf Ingestion Workflow

This skill guides the agent through the complete, end-to-end manual transcription and database ingestion process for a shelf unit row/column of books. Follow these steps sequentially:

---

## Step 1: Scan Folder Location and Read Coordinates
1. **Determine Location Coordinates**: Retrieve the folder name of the target books directory (e.g. `C22-R04`). Parse the name to extract the `column` (e.g. `C22`) and `row` (e.g. `R04`) values. These coordinates apply to all books in this folder.
2. **Directory Listing**: Use `list_dir` to retrieve all image file names in the directory. Since all files are full-resolution book cover images (without Telegram thumbnails), add all image files directly to the transcription queue.

---

## Step 2: View and Transcribe the Book Covers
For each image file in the queue, invoke the `view_file` tool to inspect the image. Transcribe the metadata in Arabic, Amharic, and English:

- **Arabic Title & Author**: Read the calligraphic script. If the book is a translation of a classical work, prioritize the original Arabic name.
- **Amharic Title & Author**: Read the Ge'ez script text.
- **English Title & Author**: Translate the Amharic and transliterate the Arabic to standard English names.
- **Publisher**: Transcribe the publisher's name if visible on the front cover or spine.
- **Book Type**: Determine if it is a `"single"` volume or part of a `"multi-volume"` set.
- **Part/Volume Number**: Note if it is a specific volume number (e.g. Vol 1, Vol 2, Part 2).

---

## Step 3: Apply Relational Deduplication and Modeling Rules
Group the transcribed books and assign the proper database fields:

### Rule A: Standalone Books (No Volumes)
- Set `bookType: "single"`.
- If duplicates are in the **same location**: Set `copyCount: N` on a single book entry.
- If duplicates are in **different locations**:
  - **Primary Entry**: Store full titles/authors, shelf location, `copyCount: 1`, and `parentBookId: undefined`.
  - **Child Entry**: Point `parentBookId` to the Primary Entry's ID, set its own shelf location, `copyCount: 1`, and leave titles/authors empty.

### Rule B: Multi-Volume Sets
- Set `bookType: "multi-volume"`.
- Specify the range using **`volumeStart`** and **`volumeEnd`** (e.g., `volumeStart: 1`, `volumeEnd: 6` for Volumes 1–6).
- If a set is split across **multiple rows** (e.g., Vol 1–6 on Row 3, Vol 7–12 on Row 9):
  - **Primary Entry (Row 3)**: Main metadata, `volumeStart: 1`, `volumeEnd: 6`, `copyCount: 1`, `parentBookId: undefined`.
  - **Child Entry (Row 9)**: `parentBookId: [ID of Primary]`, `volumeStart: 7`, `volumeEnd: 12`, `copyCount: 1`, metadata left empty.
- If you have **duplicates of a specific volume range in different places** (e.g., 2 copies of Vol 4 on Row 3, 2 copies of Vol 4 on Row 9):
  - **Primary Entry (Row 3)**: Main metadata, `volumeStart: 4`, `volumeEnd: 4`, `copyCount: 2`, `parentBookId: undefined`.
  - **Child Entry (Row 9)**: `parentBookId: [ID of Primary]`, `volumeStart: 4`, `volumeEnd: 4`, `copyCount: 2`, metadata left empty.

---

## Step 4: Generate the Standalone Seed Script
Create a TypeScript script `scripts/cXX-rXX-import.ts` containing the array of deduplicated books.

1. **Interface Definition**:
   ```typescript
   interface BookData {
     filename: string;
     titleEnglish?: string;
     titleArabic?: string;
     titleAmharic?: string;
     authorEnglish?: string;
     authorArabic?: string;
     authorAmharic?: string;
     publisher?: string;
     publisherAmharic?: string;
     edition?: string;
     bookType: "single" | "multi-volume";
     volumeStart?: number;
     volumeEnd?: number;
     copyCount?: number;
     parentBookId?: string; // Links back to primary record if duplicate/split location
   }
   ```
2. **Deduplicated Array**: Insert the `books: BookData[]` array containing the unique records.
3. **Dynamic Calculations**:
   - Calculate `physicalVolumeCount` in the payload:
     ```typescript
     physicalVolumeCount: book.bookType === "multi-volume"
       ? ((book.volumeEnd || 1) - (book.volumeStart || 1) + 1) * (book.copyCount || 1)
       : (book.copyCount || 1)
     ```

---

## Step 5: Execute the Import to Convex Production
Run the script to push files and metadata to production:

1. **Load Environment**: Get the production API URL `NEXT_PUBLIC_CONVEX_SITE_URL` from `.env.local`.
2. **Retrieve Organization ID**: Query `${convexSiteUrl}/getOrg` using Header `{ Authorization: "Bearer IMPORT_SECRET_123" }` to get the ID for organization `"mama"`.
3. **Upload Files & Save Records**:
   - For each book in the array:
     - Read the image from the parsed location directory and upload it to `${convexSiteUrl}/importImage` to retrieve the `storageId`.
     - Post the metadata (including the newly uploaded `coverStorageId`, the parsed `column` and `row` coordinates, `copyCount`, and `physicalVolumeCount`) to `${convexSiteUrl}/importBook`.
4. **Log Success**: Output the inserted `bookId` for each entry.

---

## Step 6: Verify Ingestion
- Verify in the Convex database dashboard that all books have been correctly inserted with their proper `copyCount`, `physicalVolumeCount`, `volumeStart`, and `volumeEnd` fields, and that child records are properly linked by `parentBookId`.
