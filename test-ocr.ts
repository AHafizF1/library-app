import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { bookCoverSchema, ANALYSIS_PROMPT } from "@/lib/analyze-cover";
import fs from "fs";
import path from "path";

const IMAGE_DIR = "C:\\Users\\Afiz\\Downloads\\arabic-library-checkpoint-016\\arabic-library-checkpoint-016\\images\\originals";
const IMAGES_TO_TEST = [
  "C01-R01-001.jpg",
  "C01-R03-005.jpg",
  "C01-R04-010.jpg"
];

async function runTest() {
  console.log("Starting OCR test with gemini-3.1-pro-preview via direct Google API...\n");

  for (const imageName of IMAGES_TO_TEST) {
    console.log(`Analyzing: ${imageName}`);
    const imagePath = path.join(IMAGE_DIR, imageName);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`File not found: ${imagePath}`);
      continue;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString("base64");

    try {
      const startTime = Date.now();
      const { output } = await generateText({
        model: google("gemini-2.5-flash"),
        output: Output.object({ schema: bookCoverSchema }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: ANALYSIS_PROMPT },
              { type: "file", mediaType: "image/jpeg", data: base64 },
            ],
          },
        ],
        providerOptions: {
          google: { mediaResolution: "MEDIA_RESOLUTION_HIGH" },
        },
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\nResults for ${imageName} (took ${elapsed}s):`);
      console.log(JSON.stringify(output, null, 2));
      console.log("-".repeat(40) + "\n");
    } catch (error: any) {
      console.error(`Error analyzing ${imageName}:`, error.message);
    }
  }
}

runTest();
