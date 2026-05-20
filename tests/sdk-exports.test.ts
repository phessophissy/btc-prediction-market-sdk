import { describe, expect, it } from "vitest";
import {
  BetTooSmallError,
  InsufficientFundsError,
  MarketClosedError,
  MarketError,
  MarketNotFoundError,
  SettlementNotReadyError,
} from "../src";

describe("sdk exports", () => {
  it("re-exports the custom market error classes", () => {
    expect(new MarketError("base", 1)).toBeInstanceOf(Error);
    expect(new MarketNotFoundError(7).name).toBe("MarketNotFoundError");
    expect(new MarketClosedError(7).name).toBe("MarketClosedError");
    expect(new InsufficientFundsError(20, 10).name).toBe("InsufficientFundsError");
    expect(new BetTooSmallError(10, 20).name).toBe("BetTooSmallError");
    expect(new SettlementNotReadyError(7, 100, 110).name).toBe("SettlementNotReadyError");
  });
});
