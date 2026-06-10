import fs from "fs";
import path from "path";

const books = [
  { titleAmharic: "ሕገ መንግሥታዊ ተቃርኖዎች", authorAmharic: "ፍሬሕይወት ሳሙኤል" },
  { titleAmharic: "መንግሥትና ሀብት", authorAmharic: "ብርሃኑ በሻህ (ዶ/ር)" },
  { titleAmharic: "ትውልድ አይደንገጥ እኛም እንናገር ቅፅ ፩", authorAmharic: "አንዳርጋቸው ፅጌ" },
  { titleAmharic: "የግዞት ሰንሰለት (ቅጽ ፩)", authorAmharic: "ስሜነህ ባይፈርስ" },
  { titleAmharic: "መንግሥቱ ኃ/ማርያም የስደተኛው መሪ ትረካዎች", authorAmharic: "ይታገሱ ጌትነት ገበየሁ" },
  { titleAmharic: "አጤ ቴዎድሮስ በሦስቱ ቀደምት ጸሐፍት", authorAmharic: "ደብተራ ዘነብ ኢትዮጵያዊ፣ አለቃ ወልደማርያም ዘምሁድ፣ ያልታወቀው ጸሐፊ" },
  { titleAmharic: "የኢትዮጵያ ታሪክ ከዐፄ ቴዎድሮስ እስከ ቀዳማዊ ኃይለ ሥላሴ", authorAmharic: "ተክለ ጻድቅ መኩሪያ" },
  { titleAmharic: "የኢትዮጵያ ታሪክ ከዐፄ ልብነ ድንግል እስከ ዐፄ ቴዎድሮስ", authorAmharic: "ተክለ ጻድቅ መኩሪያ" },
  { titleAmharic: "የየካቲት ንቅናቄ", authorAmharic: "ተክለ ጻድቅ መኩሪያ" },
  { titleAmharic: "ያ ትውልድ የለውጥ ማዕበል በኢትዮጵያ ቅፅ ሁለት", authorAmharic: "ክፍሉ ታደሰ" },
  { titleAmharic: "ትውልድ ያናወጠ ጦርነት ትዝታና ትውስታ ክፍል - ፪", authorAmharic: "ሻለቃ ንጋቱ ቦጋለ" },
  { titleAmharic: "የአሲምባ ፍቅር", authorAmharic: "ካሕሳይ አብርሃ ብስራት" },
  { titleAmharic: "ኢሕአፓ ስፖርት ክፍል ሦስት", authorAmharic: "ገነነ መኩሪያ (ሊብሮ)" },
  { titleAmharic: "የሚሳም ተራራ", authorAmharic: "ፍቅረማርቆስ ደስታ" },
  { titleAmharic: "ልጅነት", authorAmharic: "ዘነበ ወላ" },
  { titleAmharic: "መልኅቅ", authorAmharic: "ዘነበ ወላ" },
  { titleAmharic: "ማዕበል ጠሪ ወፍ", authorAmharic: "ዓለማየሁ ገላጋይ" },
  { titleAmharic: "ቤባንያ (ዕውነት ሐሰት)", authorAmharic: "ዓለማየሁ ገላጋይ" },
  { titleAmharic: "ምን ሆኛለሁ?", authorAmharic: "ትዕግሥት ዋልተንጉስ፣ ቴዎድሮስ ተ/አረጋይ" },
  { titleAmharic: "ማሙሽ", authorAmharic: "ማይክል አስመራው" },
  { titleAmharic: "ቴሎስ", authorAmharic: "ናሁሰናይ ፀዳሉ አበራ" },
  { titleAmharic: "ባሪያ", authorAmharic: "ሕይወት እምሻው" },
  { titleAmharic: "ዶክተር አሸብር እና ሌሎችም", authorAmharic: "አሌክስ አብርሃም" },
  { titleAmharic: "አርምሞ", authorAmharic: "ዶ/ር ኤልያስ ገብሩ አዕምሮ" },
  { titleAmharic: "አልወለድም", authorAmharic: "አቤ ጉበኛ" },
  { titleAmharic: "ጠበኛ እውነቶች", authorAmharic: "ሜሪ ፈለቀ" },
  { titleAmharic: "ዘባሲል", authorAmharic: "ፀሐይ መላኩ" },
  { titleAmharic: "መናፍቁ ካህሊል እና ሌሎችም", authorAmharic: "ካህሊል ጂብራን", authorEnglish: "Kahlil Gibran" },
  { titleAmharic: "የአጋንንት ደጆች", authorAmharic: "ይስማዕከ ወርቁ" },
  { titleAmharic: "በፍቅር ስም", authorAmharic: "ዓለማየሁ ገላጋይ" },
  { titleAmharic: "ጊዜያዊ ስጦታ", authorAmharic: "አህመድ ሁሴን" },
  { titleAmharic: "ሰመመን", authorAmharic: "ሲሳይ ንጉሡ" },
  { titleAmharic: "ወሪሳ", authorAmharic: "ዓለማየሁ ገላጋይ" },
  { titleAmharic: "መለያየት ሞት ነው", authorAmharic: "ዓለማየሁ ገላጋይ" },
  { titleAmharic: "አለማወቅ", authorAmharic: "ዳዊት ወንድምአገኝ /ዶክተር/" },
  { titleAmharic: "የፍርድ ቀን ዘመቻ", authorAmharic: "ሲድኒ ሼልደን", authorEnglish: "Sidney Sheldon" },
  { titleAmharic: "ቀለም ያጠቆረው", authorAmharic: "ከበረሁን ተሾመ" }
];

async function main() {
  const photoDir = "C:\\Users\\Afiz\\Downloads\\C22-R5";
  const col = "C22";
  const row = "R5";

  if (!fs.existsSync(photoDir)) {
    console.error(`Directory not found: ${photoDir}`);
    process.exit(1);
  }

  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    console.error("NEXT_PUBLIC_CONVEX_SITE_URL is not set.");
    process.exit(1);
  }

  const authHeader = { Authorization: "Bearer IMPORT_SECRET_123" };

  console.log("Fetching organization ID...");
  const orgRes = await fetch(`${convexSiteUrl}/getOrg`, { headers: authHeader });
  if (!orgRes.ok) {
    console.error("Failed to fetch organization ID:", await orgRes.text());
    process.exit(1);
  }
  const { organizationId } = await orgRes.json();
  if (!organizationId) {
    console.error("Organization ID not found.");
    process.exit(1);
  }
  console.log(`Using Organization ID: ${organizationId}`);

  const files = fs.readdirSync(photoDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === ".jpg" || ext === ".jpeg" || ext === ".png";
    })
    .sort();

  console.log(`Found ${files.length} cover images to process.`);
  if (files.length !== books.length) {
    console.warn(`Mismatch! We have ${books.length} book records but ${files.length} images.`);
  }

  for (let i = 0; i < Math.min(files.length, books.length); i++) {
    const filename = files[i];
    const imagePath = path.join(photoDir, filename);
    const book = books[i];
    console.log(`\n[${i + 1}/${books.length}] Processing ${filename} for book "${book.titleAmharic}"...`);

    try {
      const fileBuffer = fs.readFileSync(imagePath);
      const fileBlob = new Blob([fileBuffer], { type: "image/jpeg" });

      console.log("  Uploading cover to Convex...");
      const uploadRes = await fetch(`${convexSiteUrl}/importImage`, {
        method: "POST",
        headers: authHeader,
        body: fileBlob,
      });

      if (!uploadRes.ok) {
        console.error(`  ❌ Cover upload failed for ${filename}:`, await uploadRes.text());
        continue;
      }
      const { storageId } = await uploadRes.json();

      console.log("  Saving book record to database...");
      const payload = {
        organizationId,
        titleAmharic: book.titleAmharic,
        authorAmharic: book.authorAmharic,
        authorEnglish: book.authorEnglish,
        authorArabic: undefined,
        bookType: "single",
        copyCount: 1, // Treat all books as having single copies
        physicalVolumeCount: 1,
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
        console.error(`  ❌ Failed to save book record for ${filename}:`, await bookRes.text());
        continue;
      }

      const { bookId } = await bookRes.json();
      console.log(`  ✅ Success! Saved with Book ID: ${bookId}`);

    } catch (err) {
      console.error(`  ❌ Unexpected error processing ${filename}:`, err);
    }
  }

  console.log("\n--- Ingestion Completed! ---");
}

main().catch(err => {
  console.error("Critical script failure:", err);
  process.exit(1);
});
