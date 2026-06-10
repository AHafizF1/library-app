import fs from "fs";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    console.error("Usage: bun scripts/agent-process-image.ts <path-to-image> <col> <row>");
    process.exit(1);
  }

  const [imagePath, col, row] = args;

  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    process.exit(1);
  }

  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    console.error("NEXT_PUBLIC_CONVEX_SITE_URL is not set in environment.");
    process.exit(1);
  }

  const authHeader = { Authorization: "Bearer IMPORT_SECRET_123" };

  console.log(`\n--- Processing ${path.basename(imagePath)} (Col: ${col}, Row: ${row}) ---`);

  // 1. Analyze cover via local AI endpoint
  console.log("Analyzing cover with AI...");
  const fileBuffer = fs.readFileSync(imagePath);
  const fileBlob = new Blob([fileBuffer], { type: "image/jpeg" });
  
  const formData = new FormData();
  formData.append("cover", fileBlob, path.basename(imagePath));

  const analyzeRes = await fetch("http://localhost:3000/api/analyze-cover", {
    method: "POST",
    body: formData,
  });

  if (!analyzeRes.ok) {
    const errText = await analyzeRes.text();
    console.error("AI Analysis failed:", errText);
    process.exit(1);
  }

  const analyzeData = await analyzeRes.json();
  const bookData = analyzeData.data;
  console.log(`Extracted Book: ${bookData.titleEnglish || bookData.titleArabic || "Unknown"}`);

  // 2. Fetch Organization ID
  console.log("Fetching Organization ID...");
  const orgRes = await fetch(`${convexSiteUrl}/getOrg`, { headers: authHeader });
  if (!orgRes.ok) {
    console.error("Failed to fetch organization ID", await orgRes.text());
    process.exit(1);
  }
  const { organizationId } = await orgRes.json();
  if (!organizationId) {
    console.error("No organization found.");
    process.exit(1);
  }

  // 3. Upload Image to Convex Storage
  console.log("Uploading image to Convex...");
  const uploadRes = await fetch(`${convexSiteUrl}/importImage`, {
    method: "POST",
    headers: authHeader,
    body: fileBlob,
  });
  if (!uploadRes.ok) {
    console.error("Image upload failed:", await uploadRes.text());
    process.exit(1);
  }
  const { storageId } = await uploadRes.json();

  // 4. Save Book to Database
  console.log("Saving book to database...");
  const payload = {
    organizationId,
    titleEnglish: bookData.titleEnglish,
    titleArabic: bookData.titleArabic,
    titleAmharic: bookData.titleAmharic,
    authorEnglish: bookData.authorEnglish,
    authorArabic: bookData.authorArabic,
    authorAmharic: bookData.authorAmharic,
    publisher: bookData.publisher,
    publisherAmharic: bookData.publisherAmharic,
    isbn: bookData.isbn,
    edition: bookData.edition,
    bookType: bookData.bookType,
    expectedVolumeCount: bookData.expectedVolumeCount,
    visibleVolumes: bookData.visibleVolumes,
    copyCount: bookData.copyCount,
    physicalVolumeCount: bookData.physicalVolumeCount,
    column: col,
    row: row,
    coverStorageId: storageId,
  };

  const bookRes = await fetch(`${convexSiteUrl}/importBook`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!bookRes.ok) {
    console.error("Failed to save book:", await bookRes.text());
    process.exit(1);
  }

  const { bookId } = await bookRes.json();
  console.log(`✅ Success! Saved as Book ID: ${bookId}`);
}

main().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
