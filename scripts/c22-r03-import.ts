import fs from "fs";
import path from "path";

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
  parentBookId?: string;
}

const books: BookData[] = [
  {
    filename: "5857030426520653114_121.jpg",
    titleEnglish: "Being a Muslim",
    titleAmharic: "ሙስሊም መሆን",
    authorAmharic: "ፈትሒ የሱፍ (ትርጉም፡ ሐሰን ታጁ እና ዐሊ መሐመድ)",
    authorEnglish: "Fethi Yesuf (Translated by Hassen Taju and Ali Mohammed)",
    publisher: "Nejashi Printing Press",
    publisherAmharic: "ነጃሺ ማተሚያ ቤት",
    bookType: "single"
  },
  {
    filename: "5857030426520653115_121.jpg",
    titleEnglish: "Great Personalities on the Brink of Death",
    titleAmharic: "ታላላቅ ስብዕናዎች በሞት አፋፍ ላይ",
    authorAmharic: "መሐመድ ቢን ሷሊህ ቢን ዐሊ (ትርጉም፡ አሕመድ ሑሴን)",
    authorEnglish: "Mohammed bin Salih bin Ali (Translated by Ahmed Husein)",
    bookType: "single"
  },
  {
    filename: "5857030426520653116_121.jpg",
    titleEnglish: "Stories of the Prophets - Part 2",
    titleArabic: "قصص الأنبياء",
    titleAmharic: "የነቢያት ታሪክ - ክፍል 2",
    authorAmharic: "ይስሐቅ ወልድ (ትርጉም፡ ዐሊ ታጁ)",
    authorEnglish: "Yishaq Wold (Translated by Ali Taju)",
    bookType: "multi-volume",
    volumeStart: 2,
    volumeEnd: 2
  },
  {
    filename: "5857030426520653117_121.jpg",
    titleEnglish: "Seerah (Prophet Muhammad's History and Teachings)",
    titleAmharic: "ሲራ (የነቢዩ ሙሐመድ ታሪክና አስተምህሮት)",
    authorAmharic: "ሙስጠፋ ኪብሊ (ትርጉም፡ አድናን መሐመድ)",
    authorEnglish: "Mustafa Kibli (Translated by Adnan Mohammed)",
    publisher: "Nejashi Printing Press",
    publisherAmharic: "ነጃሺ ማተሚያ ቤት",
    bookType: "single"
  },
  {
    filename: "5857030426520653118_121.jpg",
    titleEnglish: "A Guide to Understanding Islam",
    titleArabic: "دليل فهم الإسلام",
    titleAmharic: "ኢስላምን ለመረዳት",
    publisher: "Da'wah North Riyadh",
    bookType: "single"
  },
  {
    filename: "5857030426520653119_121.jpg",
    titleEnglish: "Solution",
    titleAmharic: "መፍትሔ",
    authorAmharic: "ሲ/ር ሀናን ጃፋር",
    authorEnglish: "Sister Hanan Jafar",
    bookType: "single",
    edition: "2010 ዓ.ም"
  },
  {
    filename: "5857030426520653120_121.jpg",
    titleEnglish: "Heal Yourself with Quran",
    titleAmharic: "ጥላ ወጊን ማስወገድ (ራሳቸውን በቁርአን ይፈውሱ)",
    authorAmharic: "ፈድዋን ሁሴን እና አቡ ሱለይማን",
    authorEnglish: "Fadwan Husein and Abu Suleyman",
    publisher: "Selam International",
    publisherAmharic: "ሰላም ኢንተርናሽናል",
    bookType: "single"
  },
  {
    filename: "5857030426520653121_121.jpg",
    titleEnglish: "Heart Medicine / Treatment",
    titleAmharic: "የልብ ህክምና (ስብእናና ትርጉም)",
    authorAmharic: "እስክንድር ሰይፉ",
    authorEnglish: "Eskinder Seyfu",
    bookType: "single"
  },
  {
    filename: "5857030426520653122_121.jpg",
    titleEnglish: "1000 Sunnahs of the Prophet in 24 Hours",
    titleAmharic: "1000 የረሱል (ሰ.ዐ.ወ) ሱናዎችን በ24 ሰዓታት ውስጥ",
    authorAmharic: "ኻሊድ አል-ሑሰይናን (ትርጉም፡ ሙሐመድ ሰዒድ)",
    authorEnglish: "Khalid Al-Husaynan (Translated by Mohammed Said)",
    bookType: "single"
  },
  {
    filename: "5857030426520653123_121.jpg",
    titleEnglish: "Stories of the Prophets - Part 1",
    titleArabic: "قصص الأنبياء",
    titleAmharic: "የነቢያት ታሪክ - ክፍል 1",
    authorAmharic: "ዶ/ር አምር ኻሊድ (ትርጉም፡ ሐሰን ታጁ)",
    authorEnglish: "Dr. Amr Khaled (Translated by Hassen Taju)",
    bookType: "multi-volume",
    volumeStart: 1,
    volumeEnd: 1
  },
  {
    filename: "5857030426520653124_121.jpg",
    titleEnglish: "The Key of Life",
    titleAmharic: "የህይወት ቁልፍ",
    authorAmharic: "ዓኢድ ሻምስ አል-በሊ (ትርጉም፡ ሙስጠፋ ቱሚዲ)",
    authorEnglish: "Aid Shams Al-Beli (Translated by Access/Mustafa Tumidi)",
    bookType: "single"
  },
  {
    filename: "5857030426520653125_121.jpg",
    titleEnglish: "Wonderful Islamic Tales",
    titleAmharic: "ድንቃድንቅ ኢስላማዊ ወጎች",
    authorAmharic: "አብዱልመሊክ አቡነዒም (ትርጉም፡ አውል ሰዒድ)",
    authorEnglish: "Abdulmalik Abuneim (Translated by Awol Said)",
    bookType: "single"
  },
  {
    filename: "5857030426520653126_121.jpg",
    titleEnglish: "Tenbihat (Laws regarding Muslim women)",
    titleAmharic: "ተንቢሃት (ሙስሊም ሴቶችን የሚመለከቱ ህጎች)",
    authorAmharic: "ዶ/ር ሷሊህ ቢን ፈውዛን ቢን አብደላህ (ትርጉም፡ ጁነይድ አብዱል መናን ዑመር)",
    authorEnglish: "Dr. Salih bin Fawzan bin Abdullah (Translated by Junayd Abdul Menan Omer)",
    publisher: "Al-Tawba Printing Press",
    publisherAmharic: "አል-ተውባ ማተሚያ ቤት",
    bookType: "single"
  },
  {
    filename: "5857030426520653127_121.jpg",
    titleEnglish: "Pillars of Islam and Faith",
    titleArabic: "أركان الإسلام والإيمان",
    authorAmharic: "ሙሐመድ ጀማል መክታር",
    authorEnglish: "Mohammed Jamal Mukhtar",
    publisher: "Huda Press & Advertising Ent.",
    publisherAmharic: "አል-ሀዳ ማተሚያ",
    bookType: "single"
  },
  {
    filename: "5857030426520653128_121.jpg",
    titleEnglish: "Why Sadness! - Part 1",
    titleAmharic: "የምን ሀዘን! - ክፍል አንድ",
    authorAmharic: "ዶ/ር ዓኢድ አልቀረኒ (ትርጉም፡ ሐድያ መሐመድ)",
    authorEnglish: "Dr. A'id al-Qarni (Translated by Hadya Mohammed)",
    bookType: "multi-volume",
    volumeStart: 1,
    volumeEnd: 1
  },
  {
    filename: "5857030426520653129_121.jpg",
    titleEnglish: "Forty Hadiths",
    titleAmharic: "አርባ ሐዲስ",
    authorAmharic: "አቡ መሐመድ (Captain)",
    authorEnglish: "Abu Mohammed (Captain)",
    edition: "Ethiopian First Edition",
    bookType: "single"
  },
  {
    filename: "5857030426520653130_121.jpg",
    titleEnglish: "Searching for Truth",
    titleAmharic: "እውነትን ፍለጋ",
    authorAmharic: "ሰልማን ዋቅጋሪ ጆሬላ",
    authorEnglish: "Selman Waqgari Jorela",
    bookType: "single"
  },
  {
    filename: "5857030426520653131_121.jpg",
    titleEnglish: "Spiritual Illnesses and Their Islamic Treatment",
    titleAmharic: "መንፈሳዊ በሽታዎችና ኢስላማዊ ሕክምናዎቻቸው",
    authorAmharic: "ኡስታዝ ጁነይድ ዑበይድ አልቀረኒ ዑመር",
    authorEnglish: "Ustaz Juneyd Ubayd Al-Qarni Omer",
    bookType: "single"
  },
  {
    filename: "5857030426520653132_121.jpg",
    titleEnglish: "Explanation of the Fundamentals of Creed",
    titleArabic: "شرح أصول الإيمان",
    titleAmharic: "የእምነት መሠረቶች ማብራሪያ (ሸርሁል ኢማን)",
    authorAmharic: "ሸይኽ ሙሐመድ ቢን ዑተይሚን (ትርጉም፡ መሐመድ ጀማል መክታር)",
    authorEnglish: "Sheikh Muhammad bin Uthaymeen (Translated by Mohammed Jamal Mukhtar)",
    bookType: "single"
  },
  {
    filename: "5857030426520653134_121.jpg",
    titleEnglish: "The Context of Quran",
    titleAmharic: "የቁርአን ዳራ",
    authorAmharic: "ወሒድ ዑመር",
    authorEnglish: "Wehid Omer",
    bookType: "single"
  },
  {
    filename: "5857030426520653135_121.jpg",
    titleEnglish: "The True and Final Message",
    titleAmharic: "እውነተኛውና የመጨረሻው መልዕክት",
    bookType: "single"
  },
  {
    filename: "5857030426520653136_121.jpg",
    titleEnglish: "Who is your Lord? (Arabic Grammar)",
    titleArabic: "النحو / من ربك",
    titleAmharic: "መን ረቡክ (አንነሕው - በአምስት ቋንቋዎች የተዘጋጀ)",
    authorAmharic: "ማንሱር መሐመድ ጃሃር",
    authorEnglish: "Mansur Mohammed Jahar",
    bookType: "single"
  },
  {
    filename: "5857030426520653137_121.jpg",
    titleEnglish: "New Muslim Guide",
    titleAmharic: "ለአዲሱ ሰለምቴዎች መመሪያ",
    authorAmharic: "ፈህድ ቢን ሳሊም ባህማም",
    authorEnglish: "Fahd bin Salim Bahammam",
    bookType: "single",
    copyCount: 4
  },
  {
    filename: "5857030426520653138_121.jpg",
    titleEnglish: "Just One Message!",
    titleAmharic: "አንድ መልዕክት ብቻ!",
    authorAmharic: "ዶ/ር ናጂ አ. አርፋጅ (ትርጉም፡ ሽምሱ አንድሪስ መሐመድ)",
    authorEnglish: "Dr. Naji I. Al-Arfaj (Translated by Shimsu Andris Mohammed)",
    publisher: "Al-Safra Da'wah Office",
    bookType: "single"
  },
  {
    filename: "5857030426520653139_121.jpg",
    titleEnglish: "Life.. Without Stress",
    titleAmharic: "ህይወት.. ያለ ጭንቀት",
    authorAmharic: "ፊድዋን ሙሳ",
    authorEnglish: "Fidwan Musa",
    edition: "5th Edition",
    bookType: "single"
  },
  {
    filename: "5857030426520653141_121.jpg",
    titleEnglish: "Sunnahs of the Messenger",
    titleAmharic: "የረሱል (ሰ.ዐ.ወ) ሱናዎች",
    authorAmharic: "በመውላና ሰዒድ ሀሰን ዩሱፍ (ትርጉም፡ አብዱ ማሰው)",
    authorEnglish: "Mawlana Said Hassen Yusuf (Translated by Abdu Masew)",
    publisher: "Al-Tawba Publisher",
    bookType: "single"
  },
  {
    filename: "5857030426520653142_121.jpg",
    titleEnglish: "Monotheism in Poetry",
    titleArabic: "نظم التوحيد",
    titleAmharic: "ተውሂድ በግጥም",
    bookType: "single"
  },
  {
    filename: "5857030426520653144_121.jpg",
    titleEnglish: "Islam and Christianity (Comparative Approach)",
    titleArabic: "الإسلام والمسيحية",
    titleAmharic: "እስላምና ክርስትና (ንፅፅራዊ አቀራረብ)",
    authorAmharic: "ዶ/ር ሙሐመድ ዓሊ አል-ኹሊ",
    authorEnglish: "Dr. Muhammad Ali al-Khouli",
    publisher: "Huda Press",
    bookType: "single",
    copyCount: 7
  },
  {
    filename: "5857030426520653146_121.jpg",
    titleEnglish: "Fundamentals of Creed / Aqeedah",
    titleArabic: "أصول العقيدة",
    titleAmharic: "የዓቂዳ መሠረቶች",
    authorAmharic: "ተርጓሚው ዓብዱልናስር ዓብዱላህ አሕመድ",
    authorEnglish: "Translated by Abdulnasir Abdullah Ahmed",
    publisher: "Huda Press",
    bookType: "single",
    copyCount: 4
  },
  {
    filename: "5857030426520653152_121.jpg",
    titleEnglish: "Riyad as-Salihin for Muslim Children",
    titleArabic: "رياض الصالحين لأطفال المسلمين",
    authorArabic: "أبو عبد الرحمن عوض لطفي",
    authorEnglish: "Abu Abd ar-Rahman Awad Lutfi",
    publisher: "Dar Ibn Rajab",
    bookType: "single",
    copyCount: 11
  },
  {
    filename: "5857030426520653158_121.jpg",
    titleEnglish: "Fortress of the Muslim",
    titleArabic: "حصن المسلم",
    titleAmharic: "ሒስኑል-ሙስሊም (የሙስሊሞች ምሽግ)",
    publisher: "Rabwah / islamhouse.com",
    bookType: "single"
  }
];

async function main() {
  const envFile = fs.existsSync(".env.prod") ? ".env.prod" : ".env.local";
  console.log(`Reading environment from ${envFile}...`);
  const envContent = fs.readFileSync(envFile, "utf8");
  const siteUrlMatch = envContent.match(/NEXT_PUBLIC_CONVEX_SITE_URL\s*=\s*(.*)/);
  if (!siteUrlMatch) {
    console.error(`Could not find NEXT_PUBLIC_CONVEX_SITE_URL in ${envFile}`);
    process.exit(1);
  }
  const convexSiteUrl = siteUrlMatch[1].trim();
  const authHeader = { Authorization: "Bearer IMPORT_SECRET_123" };

  console.log(`Using Convex Site URL: ${convexSiteUrl}`);

  // Fetch organization ID
  console.log("Fetching Organization ID...");
  const orgRes = await fetch(`${convexSiteUrl}/getOrg`, { headers: authHeader });
  if (!orgRes.ok) {
    console.error("Failed to fetch organization ID", await orgRes.text());
    process.exit(1);
  }
  const { organizationId } = await orgRes.json();
  if (!organizationId) {
    console.error("No organization 'mama' found.");
    process.exit(1);
  }
  console.log(`Found organization ID: ${organizationId}`);

  const photoDir = "C:\\Users\\Afiz\\AppData\\Local\\Packages\\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw\\LocalState\\0\\photos";

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const imagePath = path.join(photoDir, book.filename);

    console.log(`\n[${i + 1}/${books.length}] Processing ${book.filename}...`);
    
    if (!fs.existsSync(imagePath)) {
      console.error(`File not found: ${imagePath}`);
      continue;
    }

    // 1. Read file and prepare Blob
    const fileBuffer = fs.readFileSync(imagePath);
    const fileBlob = new Blob([fileBuffer], { type: "image/jpeg" });

    // 2. Upload image to Convex
    console.log(`Uploading cover image to Convex storage...`);
    const uploadRes = await fetch(`${convexSiteUrl}/importImage`, {
      method: "POST",
      headers: authHeader,
      body: fileBlob,
    });

    if (!uploadRes.ok) {
      console.error(`Image upload failed for ${book.filename}:`, await uploadRes.text());
      continue;
    }
    const { storageId } = await uploadRes.json();
    console.log(`Uploaded! Storage ID: ${storageId}`);

    // 3. Save book record to database
    console.log(`Saving book: ${book.titleEnglish || book.titleArabic || book.titleAmharic}`);
    const payload = {
      organizationId,
      titleEnglish: book.titleEnglish,
      titleArabic: book.titleArabic,
      titleAmharic: book.titleAmharic,
      authorEnglish: book.authorEnglish,
      authorArabic: book.authorArabic,
      authorAmharic: book.authorAmharic,
      publisher: book.publisher,
      publisherAmharic: book.publisherAmharic,
      edition: book.edition,
      bookType: book.bookType,
      volumeStart: book.volumeStart,
      volumeEnd: book.volumeEnd,
      copyCount: book.copyCount || 1,
      physicalVolumeCount: book.bookType === "multi-volume"
        ? ((book.volumeEnd || 1) - (book.volumeStart || 1) + 1) * (book.copyCount || 1)
        : (book.copyCount || 1),
      column: "C22",
      row: "R03",
      coverStorageId: storageId,
      parentBookId: book.parentBookId,
    };

    const bookRes = await fetch(`${convexSiteUrl}/importBook`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!bookRes.ok) {
      console.error(`Failed to save book for ${book.filename}:`, await bookRes.text());
      continue;
    }
    const { bookId } = await bookRes.json();
    console.log(`✅ Success! Book ID: ${bookId}`);
  }
  
  console.log("\nAll done!");
}

main().catch(err => {
  console.error("Execution failed:", err);
});
