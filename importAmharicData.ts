import fs from "fs";
import path from "path";

// Configuration
// You can set these to your production URL and the secret we created.
// e.g. CONVEX_URL=https://harmless-squirrel-908.convex.cloud
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://dutiful-sandpiper-382.convex.site";
const SECRET = "IMPORT_SECRET_123";

const DATASET_DIR = "C:\\Users\\Afiz\\Downloads\\arabic-library-portable-export\\arabic-library-portable-export";
const BOOKS_JSON_PATH = path.join(DATASET_DIR, "books.json");
const MANIFEST_PATH = path.join(DATASET_DIR, "image_manifest.json");

let imageManifest: any[] = [];
try {
  imageManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
} catch (e) {
  console.warn("Could not load image_manifest.json. Image uploads may fail.");
}

async function uploadImage(imageId: string): Promise<string | null> {
  const manifestEntry = imageManifest.find((m: any) => m.imageId === imageId);
  if (!manifestEntry || !manifestEntry.thumbnailPath) {
    console.warn(`Warning: Could not find thumbnailPath for ${imageId} in manifest`);
    return null;
  }
  
  const imagePath = path.join(DATASET_DIR, manifestEntry.thumbnailPath);
  if (!fs.existsSync(imagePath)) {
    console.warn(`Warning: Image not found at ${imagePath}`);
    return null;
  }

  const fileData = fs.readFileSync(imagePath);
  const response = await fetch(`${CONVEX_SITE_URL}/importImage`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SECRET}`,
      "Content-Type": "image/jpeg",
    },
    body: fileData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image ${imageId}: ${await response.text()}`);
  }

  const { storageId } = await response.json();
  return storageId;
}

async function uploadBook(bookData: any) {
  const response = await fetch(`${CONVEX_SITE_URL}/importBook`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload book ${bookData.titleAmharic || bookData.titleEnglish}: ${await response.text()}`);
  }

  return await response.json();
}

async function main() {
  console.log(`Fetching organization ID from ${CONVEX_SITE_URL}...`);
  const orgResponse = await fetch(`${CONVEX_SITE_URL}/getOrg`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${SECRET}` },
  });
  if (!orgResponse.ok) {
    console.error(`Failed to fetch organization ID. Status: ${orgResponse.status} ${orgResponse.statusText}. Error: ${await orgResponse.text()}`);
    return;
  }
  const { organizationId } = await orgResponse.json();
  if (!organizationId) {
    console.error("No organization found. Please create one in the app first.");
    return;
  }
  console.log(`Using Organization ID: ${organizationId}`);

  console.log(`Reading dataset from ${BOOKS_JSON_PATH}`);
  const rawData = fs.readFileSync(BOOKS_JSON_PATH, "utf-8");
  const books = JSON.parse(rawData);

  console.log(`Found ${books.length} books. Starting import...`);

  let successCount = 0;

  for (const book of books) {
    // Process locations (flattening them out to separate records if multiple)
    // Most books only have 1 location, but some have more.
    const locations = book.copyLocations || [{}];

    for (const loc of locations) {
      console.log(`Importing: ${book.title.am || book.title.en}`);
      
      let coverStorageId = undefined;
      // Get the first image ID associated with this location
      const imageId = loc.sourceImageIds?.[0];
      if (imageId) {
        console.log(`  Uploading image ${imageId}...`);
        const storageId = await uploadImage(imageId);
        if (storageId) {
          coverStorageId = storageId;
        }
      }

      const bookRecord = {
        organizationId,
        titleAmharic: book.title.am || undefined,
        titleEnglish: book.title.en || undefined,
        // we skip titleArabic per instructions
        authorAmharic: book.author.am || undefined,
        authorEnglish: book.author.en || undefined,
        publisherAmharic: book.publisher.am || undefined,
        publisherEnglish: book.publisher.en || undefined,
        edition: book.edition || undefined,
        bookType: book.bookType,
        expectedVolumeCount: book.expectedVolumeCount,
        visibleVolumes: loc.visibleVolumes || book.visibleVolumes,
        copyCount: loc.copyCount,
        physicalVolumeCount: loc.physicalVolumeCount || loc.copyCount,
        column: loc.column || book.column,
        row: loc.row || book.row,
        notes: book.notes,
        coverStorageId,
      };

      try {
        await uploadBook(bookRecord);
        successCount++;
        console.log(`  Successfully imported.`);
      } catch (e: any) {
        console.error(`  Error importing book: ${e.message}`);
      }
    }
  }

  console.log(`\nImport complete! Successfully imported ${successCount} records.`);
}

main().catch(console.error);
