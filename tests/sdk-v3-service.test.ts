// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import {
  MarketContractService,
  decodeMarketResponse,
  decodeUserPositionResponse,
} from "../src";

describe("sdk V3 surface", () => {
  it("keeps the V3 contract as the default target", () => {
    const service = new MarketContractService("SP123", true);

    expect((service as any).contractName).toBe("btc-prediction-market-v3");
  });

  it("does not expose stale betting helpers on the V3 service", () => {
    const service = new MarketContractService("SP123", true) as any;

    expect(service.placeBet).toBeUndefined();
    expect(service.settleMarket).toBeUndefined();
    expect(service.claimWinnings).toBeUndefined();
    expect(service.createMultiMarket).toBeUndefined();
    expect(service.getMarketOdds).toBeUndefined();
  });

  it("rejects invalid market ids before getMarket performs a read", async () => {
    const service = new MarketContractService("SP123", true) as any;
    service.readContract = vi.fn();

    await expect(service.getMarket(-1)).rejects.toThrow(
      "Market ID must be a non-negative integer"
    );
    expect(service.readContract).not.toHaveBeenCalled();
  });

  it("rejects invalid market ids before getUserPosition performs a read", async () => {
    const service = new MarketContractService("SP123", true) as any;
    service.readContract = vi.fn();

    await expect(service.getUserPosition(1.5, "SP2USER")).rejects.toThrow(
      "Market ID must be a non-negative integer"
    );
    expect(service.readContract).not.toHaveBeenCalled();
  });

  it("rejects invalid standard principals before getUserPosition performs a read", async () => {
    const service = new MarketContractService("SP123", true) as any;
    service.readContract = vi.fn();

    await expect(service.getUserPosition(1, "SP123.contract")).rejects.toThrow(
      "Expected a standard Stacks address without a contract suffix"
    );
    expect(service.readContract).not.toHaveBeenCalled();
  });

  it("rejects invalid ownership recipients before transferOwnership builds a tx", async () => {
    const service = new MarketContractService("SP123", true) as any;
    service.callContract = vi.fn();

    await expect(service.transferOwnership(" ", "sender-key")).rejects.toThrow(
      "Stacks address is required"
    );
    expect(service.callContract).not.toHaveBeenCalled();
  });

  it("rejects invalid withdrawal amounts before withdrawFees builds a tx", async () => {
    const service = new MarketContractService("SP123", true) as any;
    service.callContract = vi.fn();

    await expect(service.withdrawFees(0, "SP2C2Q4JY1Q9W2D5J1X7A7M6D0A8TR3M6L5Z9P4M1", "sender-key")).rejects.toThrow(
      "Amount must be a positive integer number of microSTX"
    );
    expect(service.callContract).not.toHaveBeenCalled();
  });

  it("rejects invalid withdrawal recipients before emergencyWithdraw builds a tx", async () => {
    const service = new MarketContractService("SP123", true) as any;
    service.callContract = vi.fn();

    await expect(service.emergencyWithdraw(1000, "not-an-address", "sender-key")).rejects.toThrow(
      "Stacks address must be a valid standard principal string"
    );
    expect(service.callContract).not.toHaveBeenCalled();
  });
});

describe("sdk V3 decoders", () => {
  it("decodes a market tuple into a flat V3 market object", () => {
    const market = decodeMarketResponse(62, {
      type: "(optional market)",
      value: {
        type: "(tuple market)",
        value: {
          creator: { type: "principal", value: "SP39SAY10HP2AV9EPT29AD4706XK2Q2RM741ZHBZK" },
          title: { type: "(string-utf8 27)", value: "BTC Above $150k by Feb 2026" },
          description: {
            type: "(string-utf8 92)",
            value:
              "Will Bitcoin price exceed $150,000 USD by February 28, 2026? Settlement based on block hash.",
          },
          "settlement-burn-height": { type: "uint", value: "934032" },
          "settlement-type": { type: "(string-ascii 13)", value: "hash-even-odd" },
          "possible-outcomes": { type: "uint", value: "3" },
          "total-pool": { type: "uint", value: "0" },
          "outcome-a-pool": { type: "uint", value: "0" },
          "outcome-b-pool": { type: "uint", value: "0" },
          "outcome-c-pool": { type: "uint", value: "0" },
          "outcome-d-pool": { type: "uint", value: "0" },
          "winning-outcome": { type: "(optional none)", value: null },
          settled: { type: "bool", value: false },
          "settled-at-burn-height": { type: "(optional none)", value: null },
          "settlement-block-hash": { type: "(optional none)", value: null },
          "created-at-burn-height": { type: "uint", value: "229104" },
          "created-at-stacks-height": { type: "uint", value: "6150989" },
        },
      },
    });

    expect(market).toEqual({
      id: 62,
      creator: "SP39SAY10HP2AV9EPT29AD4706XK2Q2RM741ZHBZK",
      title: "BTC Above $150k by Feb 2026",
      description:
        "Will Bitcoin price exceed $150,000 USD by February 28, 2026? Settlement based on block hash.",
      settlementBurnHeight: 934032,
      settlementType: "hash-even-odd",
      possibleOutcomes: 3,
      totalPool: 0,
      outcomeAPool: 0,
      outcomeBPool: 0,
      outcomeCPool: 0,
      outcomeDPool: 0,
      winningOutcome: null,
      settled: false,
      settledAtBurnHeight: null,
      settlementBlockHash: null,
      createdAtBurnHeight: 229104,
      createdAtStacksHeight: 6150989,
    });
  });

  it("decodes a user position tuple into the V3 user position shape", () => {
    const position = decodeUserPositionResponse(5, "SP2USER", {
      type: "(optional position)",
      value: {
        type: "(tuple position)",
        value: {
          "outcome-a-amount": { type: "uint", value: "100000" },
          "outcome-b-amount": { type: "uint", value: "200000" },
          "outcome-c-amount": { type: "uint", value: "0" },
          "outcome-d-amount": { type: "uint", value: "0" },
          "total-invested": { type: "uint", value: "300000" },
          claimed: { type: "bool", value: false },
        },
      },
    });

    expect(position).toEqual({
      marketId: 5,
      userAddress: "SP2USER",
      outcomeAAmount: 100000,
      outcomeBAmount: 200000,
      outcomeCAmount: 0,
      outcomeDAmount: 0,
      totalInvested: 300000,
      claimed: false,
    });
  });

  it("returns null for optional none market and position responses", () => {
    expect(
      decodeMarketResponse(1, { type: "(optional none)", value: null })
    ).toBeNull();
    expect(
      decodeUserPositionResponse(1, "SP2USER", { type: "(optional none)", value: null })
    ).toBeNull();
  });
});
