import { describe, expect, it } from "vitest";
import { validateMarketId, validateStandardPrincipal } from "../src";

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

  it("accepts standard Stacks principals", () => {
    expect(validateStandardPrincipal("SP2C2Q4JY1Q9W2D5J1X7A7M6D0A8TR3M6L5Z9P4M1")).toEqual({
      valid: true,
    });
  });

  it("rejects empty and contract principal addresses", () => {
    expect(validateStandardPrincipal("   ")).toEqual({
      valid: false,
      error: "Stacks address is required",
    });
    expect(validateStandardPrincipal("SP123.contract-name")).toEqual({
      valid: false,
      error: "Expected a standard Stacks address without a contract suffix",
    });
  });
});
