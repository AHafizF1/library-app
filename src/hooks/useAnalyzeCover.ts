import { useState, useCallback } from "react";
import type { BookDraft } from "@/lib/book-json";

export type AnalysisState =
  | { status: "idle" }
  | { status: "analyzing" }
  | { status: "done"; draft: Partial<BookDraft> }
  | { status: "error"; message: string };

export function useAnalyzeCover() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });

  const analyze = useCallback(async (file: File) => {
    setState({ status: "analyzing" });
    try {
      const formData = new FormData();
      formData.append("cover", file);

      const response = await fetch("/api/analyze-cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Analysis failed (${response.status})`);
      }

      const { draft } = await response.json();
      setState({ status: "done", draft });
    } catch (error: any) {
      setState({
        status: "error",
        message: error.message || "Analysis failed. Please try again.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, analyze, reset };
}
