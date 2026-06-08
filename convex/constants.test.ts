import { expect, test } from "vitest";
import { DEFAULT_ROWS_PER_COLUMN } from "./constants";

test("DEFAULT_ROWS_PER_COLUMN is 6", () => {
  expect(DEFAULT_ROWS_PER_COLUMN).toBe(6);
});
