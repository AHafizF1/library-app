import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const uploadImage = httpAction(async (ctx, request) => {
  if (request.headers.get("Authorization") !== "Bearer IMPORT_SECRET_123") {
    return new Response("Unauthorized", { status: 401 });
  }
  const blob = await request.blob();
  const storageId = await ctx.storage.store(blob);
  return new Response(JSON.stringify({ storageId }), { headers: { "Content-Type": "application/json" } });
});

export const createBook = httpAction(async (ctx, request) => {
  if (request.headers.get("Authorization") !== "Bearer IMPORT_SECRET_123") {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await request.json();

  const clean = (value?: string) => value?.trim() || undefined;

  const bookId = await ctx.runMutation(internal.internalBooks.importBookRaw, {
    organizationId: body.organizationId,
    titleEnglish: clean(body.titleEnglish),
    titleArabic: clean(body.titleArabic),
    titleAmharic: clean(body.titleAmharic),
    authorEnglish: clean(body.authorEnglish),
    authorArabic: clean(body.authorArabic),
    authorAmharic: clean(body.authorAmharic),
    publisher: clean(body.publisher),
    publisherAmharic: clean(body.publisherAmharic),
    isbn: clean(body.isbn),
    edition: clean(body.edition),
    bookType: body.bookType,
    volumeStart: body.volumeStart,
    volumeEnd: body.volumeEnd,
    copyCount: body.copyCount,
    physicalVolumeCount: body.physicalVolumeCount,
    column: clean(body.column),
    row: clean(body.row),
    notes: clean(body.notes),
    coverStorageId: body.coverStorageId,
    parentBookId: body.parentBookId,
  });

  return new Response(JSON.stringify({ bookId }), { headers: { "Content-Type": "application/json" } });
});

export const getOrg = httpAction(async (ctx, request) => {
  if (request.headers.get("Authorization") !== "Bearer IMPORT_SECRET_123") {
    return new Response("Unauthorized", { status: 401 });
  }
  const orgs = await ctx.runQuery(internal.internalBooks.getOrgRaw, {});
  return new Response(JSON.stringify({ organizationId: orgs[0]?._id }), { headers: { "Content-Type": "application/json" } });
});
