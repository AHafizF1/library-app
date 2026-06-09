import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { bookCoverSchema, ANALYSIS_PROMPT, mapCoverResultToDraft } from "@/lib/analyze-cover";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("cover") as File | null;

    if (!file || !file.type.startsWith("image/")) {
      return Response.json(
        { error: "A valid image file is required." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "Image must be smaller than 10 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const { output } = await generateText({
      model: google("gemini-2.5-pro"),
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

    if (!output) {
      return Response.json(
        { error: "Could not extract book information from this image." },
        { status: 422 }
      );
    }

    const draft = mapCoverResultToDraft(output);
    return Response.json({ draft });
  } catch (error: any) {
    console.error("Cover analysis failed:", error);
    return Response.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
