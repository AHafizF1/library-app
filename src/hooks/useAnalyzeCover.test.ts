import { describe, expect, test, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnalyzeCover } from "./useAnalyzeCover";

beforeEach(() => vi.clearAllMocks());

describe("useAnalyzeCover", () => {
  test("starts in idle state", () => {
    const { result } = renderHook(() => useAnalyzeCover());
    expect(result.current.state.status).toBe("idle");
  });

  test("transitions to analyzing when analyze is called", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any; // never resolves
    const { result } = renderHook(() => useAnalyzeCover());
    act(() => {
      result.current.analyze(new File(["img"], "cover.jpg", { type: "image/jpeg" }));
    });
    expect(result.current.state.status).toBe("analyzing");
  });

  test("transitions to done with draft on success", async () => {
    const mockDraft = { titleEnglish: "Test", titleArabic: "اختبار" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ draft: mockDraft }),
    }) as any;

    const { result } = renderHook(() => useAnalyzeCover());
    await act(async () => {
      await result.current.analyze(new File(["img"], "cover.jpg", { type: "image/jpeg" }));
    });

    expect(result.current.state.status).toBe("done");
    if (result.current.state.status === "done") {
      expect(result.current.state.draft.titleEnglish).toBe("Test");
      expect(result.current.state.draft.titleArabic).toBe("اختبار");
    }
  });

  test("transitions to error on failed response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Server error" }),
    }) as any;

    const { result } = renderHook(() => useAnalyzeCover());
    await act(async () => {
      await result.current.analyze(new File(["img"], "cover.jpg", { type: "image/jpeg" }));
    });

    expect(result.current.state.status).toBe("error");
    if (result.current.state.status === "error") {
      expect(result.current.state.message).toBe("Server error");
    }
  });

  test("reset returns to idle state", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ draft: {} }),
    }) as any;

    const { result } = renderHook(() => useAnalyzeCover());
    await act(async () => {
      await result.current.analyze(new File(["img"], "cover.jpg", { type: "image/jpeg" }));
    });
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
