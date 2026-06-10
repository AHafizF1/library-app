import { Doc } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

/**
 * Resolves a book document, merging the parent book's metadata if parentBookId is present.
 * Keeps local fields (row, column, volumeStart, volumeEnd, copyCount) from the child document.
 */
export async function resolveBook(ctx: QueryCtx, book: Doc<"books">) {
  const coverUrl = book.coverStorageId ? await ctx.storage.getUrl(book.coverStorageId) : null;

  if (book.parentBookId) {
    const parent = await ctx.db.get(book.parentBookId);
    if (parent) {
      const parentCoverUrl = parent.coverStorageId
        ? await ctx.storage.getUrl(parent.coverStorageId)
        : null;

      return {
        id: book._id,
        parentBookId: book.parentBookId,
        titleEnglish: book.titleEnglish || parent.titleEnglish,
        titleArabic: book.titleArabic || parent.titleArabic,
        titleAmharic: book.titleAmharic || parent.titleAmharic,
        authorEnglish: book.authorEnglish || parent.authorEnglish,
        authorArabic: book.authorArabic || parent.authorArabic,
        authorAmharic: book.authorAmharic || parent.authorAmharic,
        publisher: book.publisher || parent.publisher,
        publisherAmharic: book.publisherAmharic || parent.publisherAmharic,
        edition: book.edition || parent.edition,
        isbn: book.isbn || parent.isbn,
        bookType: book.bookType || parent.bookType,
        volumeStart: book.volumeStart,
        volumeEnd: book.volumeEnd,
        copyCount: book.copyCount ?? 1,
        physicalVolumeCount: book.physicalVolumeCount ?? 1,
        column: book.column,
        row: book.row,
        notes: book.notes,
        coverUrl: coverUrl || parentCoverUrl,
      };
    }
  }

  return {
    id: book._id,
    parentBookId: book.parentBookId,
    titleEnglish: book.titleEnglish,
    titleArabic: book.titleArabic,
    titleAmharic: book.titleAmharic,
    authorEnglish: book.authorEnglish,
    authorArabic: book.authorArabic,
    authorAmharic: book.authorAmharic,
    publisher: book.publisher,
    publisherAmharic: book.publisherAmharic,
    edition: book.edition,
    isbn: book.isbn,
    bookType: book.bookType,
    volumeStart: book.volumeStart,
    volumeEnd: book.volumeEnd,
    copyCount: book.copyCount ?? 1,
    physicalVolumeCount: book.physicalVolumeCount ?? 1,
    column: book.column,
    row: book.row,
    notes: book.notes,
    coverUrl,
  };
}
