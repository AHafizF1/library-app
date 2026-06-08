import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi, beforeEach } from "vitest";
import AddBookPage from "./page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock convex/react
const mockCreateBook = vi.fn();
const mockGenerateUploadUrl = vi.fn().mockResolvedValue("https://fake.url");
const mockOrganization = { id: "org_123" };

vi.mock("convex/react", () => ({
  useQuery: () => mockOrganization,
  useMutation: (apiMethod: any) => {
    if (apiMethod.name === "create") return mockCreateBook;
    if (apiMethod.name === "generateUploadUrl") return mockGenerateUploadUrl;
    return vi.fn();
  },
}));

vi.mock("../../../../../convex/_generated/api", () => ({
  api: {
    organizations: { current: {} },
    books: { create: { name: "create" }, generateUploadUrl: { name: "generateUploadUrl" } },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ storageId: "storage_123" }),
  }) as any;
});

test("full flow: upload cover, paste full JSON, and save", async () => {
  const user = userEvent.setup();
  const { container } = render(<AddBookPage />);

  // 1. Upload cover
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["fake-image-content"], "cover.jpg", { type: "image/jpeg" });
  await user.upload(fileInput, file);

  // 2. Paste JSON
  const textAreas = screen.getAllByRole("textbox");
  const jsonTextarea = textAreas[textAreas.length - 1]; // The JSON import textarea is the last one
  const jsonPayload = {
    title: { en: "Test Book" },
    visibleVolumes: [1, 2]
  };
  fireEvent.change(jsonTextarea, { target: { value: JSON.stringify(jsonPayload) } });

  // 3. Click Load JSON
  await user.click(screen.getByText("Load JSON"));

  // Check form is populated
  const titleInput = screen.getByDisplayValue("Test Book");
  expect(titleInput).toBeDefined();

  // 4. Submit
  await user.click(screen.getByText("Save and add another"));

  // Verify that upload url was generated
  await waitFor(() => {
    expect(mockGenerateUploadUrl).toHaveBeenCalledWith({ organizationId: "org_123" });
  });
  
  // Verify that fetch was called to upload the image
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith("https://fake.url", expect.objectContaining({
      method: "POST",
    }));
  });

  // Verify the book is created with correct parsed json and storageId
  await waitFor(() => {
    expect(mockCreateBook).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: "org_123",
      titleEnglish: "Test Book",
      visibleVolumes: [1, 2],
      coverStorageId: "storage_123",
    }));
  });
});
