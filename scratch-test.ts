import { parseBookJson } from "./src/lib/book-json";

const testCases = [
  // 1. Array with multiple books
  `[
    { "titleEnglish": "Book 1" },
    { "titleEnglish": "Book 2" }
  ]`,
  
  // 2. Multiple sequential objects
  `
  { "titleEnglish": "Sequential 1" }
  { "titleEnglish": "Sequential 2" }
  `,
  
  // 3. Markdown block
  `
  \`\`\`json
  { "titleEnglish": "Markdown Book" }
  \`\`\`
  `,
  
  // 4. Object with trailing garbage
  `
  { "titleEnglish": "Garbage Book" }
  Some text that the LLM also spit out!
  `,
  
  // 5. Empty
  ``
];

testCases.forEach((tc, i) => {
  try {
    const result = parseBookJson(tc);
    console.log(`Test ${i + 1} Success:`, result.titleEnglish);
  } catch (e) {
    console.error(`Test ${i + 1} Failed:`, e instanceof Error ? e.message : String(e));
  }
});
