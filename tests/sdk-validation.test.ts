import { describe, expect, it } from "vitest";
import { validateMarketId } from "../src";

describe("validation helpers", () => {
  it("accepts non-negative integer market ids", () => {
    expect(validateMarketId(0)).toEqual({ valid: true });
    expect(validateMarketId(42)).toEqual({ valid: true });
  });

  it("rejects negative and fractional market ids", () => {
    expect(validateMarketId(-1)).toEqual({
      valid: false,
      error: "Market ID must be a non-negative integer",
    });
    expect(validateMarketId(1.5)).toEqual({
      valid: false,
      error: "Market ID must be a non-negative integer",
    });
  });
});
