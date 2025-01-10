import { describe, expect, test } from "vitest";

import { truncateHash } from "./truncateHash";

describe("truncateHash", () => {
  test("should return an empty string if no address is provided", () => {
    expect(truncateHash("")).toBe("");
  });

  test("should truncate the hash correctly with default lengths", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateHash(address)).toBe("0x12...5678");
  });

  test("should truncate the hash correctly with custom lengths", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateHash(address, 6, 6)).toBe("0x1234...345678");
  });
});
