// @vitest-environment node

import { describe, expect, it, beforeEach, vi } from "vitest";
import { decodeMarketResponse, decodeUserPositionResponse } from "../src";

/**
 * Additional Edge Case Tests for Response Decoders
 * Tests response handling with unusual but valid Clarity values
 */

describe("Response Decoders - Edge Cases", () => {
  describe("decodeMarketResponse - Edge Cases", () => {
    it("should handle markets with maximum values", () => {
      const maxValuesMarket = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SP99999999999999999999999999999999999999" },
            title: { type: "(string-utf8 256)", value: "A".repeat(256) },
            description: { type: "(string-utf8 1024)", value: "B".repeat(1024) },
            "settlement-burn-height": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "settlement-type": { type: "(string-ascii 13)", value: "hash-even-odd" },
            "possible-outcomes": { type: "uint", value: "4" },
            "total-pool": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "outcome-a-pool": { type: "uint", value: "999999999" },
            "outcome-b-pool": { type: "uint", value: "999999999" },
            "outcome-c-pool": { type: "uint", value: "999999999" },
            "outcome-d-pool": { type: "uint", value: "999999999" },
            "winning-outcome": { type: "uint", value: "3" },
            settled: { type: "bool", value: true },
            "settled-at-burn-height": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "settlement-block-hash": { type: "(optional (buff 32))", value: "0x" + "ff".repeat(32) },
            "created-at-burn-height": { type: "uint", value: "1" },
            "created-at-stacks-height": { type: "uint", value: "1" },
          },
        },
      };

      const market = decodeMarketResponse(999, maxValuesMarket);

      expect(market).toBeDefined();
      expect(market?.id).toBe(999);
      expect(market?.title.length).toBe(256);
      expect(market?.possibleOutcomes).toBe(4);
      expect(market?.settled).toBe(true);
    });

    it("should handle markets with zero values", () => {
      const zeroMarket = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SPZERO" },
            title: { type: "(string-utf8 3)", value: "ABC" },
            description: { type: "(string-utf8 5)", value: "ABCDE" },
            "settlement-burn-height": { type: "uint", value: "0" },
            "settlement-type": { type: "(string-ascii 13)", value: "normal" },
            "possible-outcomes": { type: "uint", value: "0" },
            "total-pool": { type: "uint", value: "0" },
            "outcome-a-pool": { type: "uint", value: "0" },
            "outcome-b-pool": { type: "uint", value: "0" },
            "outcome-c-pool": { type: "uint", value: "0" },
            "outcome-d-pool": { type: "uint", value: "0" },
            "winning-outcome": { type: "(optional none)", value: null },
            settled: { type: "bool", value: false },
            "settled-at-burn-height": { type: "(optional none)", value: null },
            "settlement-block-hash": { type: "(optional none)", value: null },
            "created-at-burn-height": { type: "uint", value: "0" },
            "created-at-stacks-height": { type: "uint", value: "0" },
          },
        },
      };

      const market = decodeMarketResponse(0, zeroMarket);

      expect(market).toBeDefined();
      expect(market?.possibleOutcomes).toBe(0);
      expect(market?.totalPool).toBe(0);
      expect(market?.settled).toBe(false);
    });

    it("should handle nested optional values correctly", () => {
      const nestedOptional = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SPNESTED" },
            title: { type: "(string-utf8 4)", value: "TEST" },
            description: { type: "(string-utf8 11)", value: "TEST MARKET" },
            "settlement-burn-height": { type: "uint", value: "850000" },
            "settlement-type": { type: "(string-ascii 13)", value: "test-type" },
            "possible-outcomes": { type: "uint", value: "2" },
            "total-pool": { type: "uint", value: "1000000" },
            "outcome-a-pool": { type: "uint", value: "500000" },
            "outcome-b-pool": { type: "uint", value: "500000" },
            "outcome-c-pool": { type: "uint", value: "0" },
            "outcome-d-pool": { type: "uint", value: "0" },
            "winning-outcome": { type: "(optional (uint))", value: { type: "uint", value: "1" } },
            settled: { type: "bool", value: true },
            "settled-at-burn-height": { type: "(optional (uint))", value: { type: "uint", value: "851000" } },
            "settlement-block-hash": { type: "(optional (buff 32))", value: null },
            "created-at-burn-height": { type: "uint", value: "100000" },
            "created-at-stacks-height": { type: "uint", value: "5000000" },
          },
        },
      };

      const market = decodeMarketResponse(100, nestedOptional);

      expect(market).toBeDefined();
      expect(market?.winningOutcome).toBe(1);
      expect(market?.settledAtBurnHeight).toBe(851000);
      expect(market?.settlementBlockHash).toBeNull();
    });

    it("should handle market with all 4 outcomes", () => {
      const fourOutcomeMarket = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SPFOUR" },
            title: { type: "(string-utf8 14)", value: "Four Outcomes" },
            description: { type: "(string-utf8 29)", value: "Market with all 4 outcomes pool" },
            "settlement-burn-height": { type: "uint", value: "850000" },
            "settlement-type": { type: "(string-ascii 13)", value: "multi-outcome" },
            "possible-outcomes": { type: "uint", value: "4" },
            "total-pool": { type: "uint", value: "4000000" },
            "outcome-a-pool": { type: "uint", value: "1000000" },
            "outcome-b-pool": { type: "uint", value: "1000000" },
            "outcome-c-pool": { type: "uint", value: "1000000" },
            "outcome-d-pool": { type: "uint", value: "1000000" },
            "winning-outcome": { type: "(optional none)", value: null },
            settled: { type: "bool", value: false },
            "settled-at-burn-height": { type: "(optional none)", value: null },
            "settlement-block-hash": { type: "(optional none)", value: null },
            "created-at-burn-height": { type: "uint", value: "840000" },
            "created-at-stacks-height": { type: "uint", value: "6000000" },
          },
        },
      };

      const market = decodeMarketResponse(50, fourOutcomeMarket);

      expect(market).toBeDefined();
      expect(market?.possibleOutcomes).toBe(4);
      expect(market?.outcomeAPool).toBe(1000000);
      expect(market?.outcomeBPool).toBe(1000000);
      expect(market?.outcomeCPool).toBe(1000000);
      expect(market?.outcomeDPool).toBe(1000000);
      expect(market?.totalPool).toBe(4000000);
    });
  });

  describe("decodeUserPositionResponse - Edge Cases", () => {
    it("should handle user position with zero investments", () => {
      const zeroPosition = {
        type: "(optional position)",
        value: {
          type: "(tuple position)",
          value: {
            "outcome-a-amount": { type: "uint", value: "0" },
            "outcome-b-amount": { type: "uint", value: "0" },
            "outcome-c-amount": { type: "uint", value: "0" },
            "outcome-d-amount": { type: "uint", value: "0" },
            "total-invested": { type: "uint", value: "0" },
            claimed: { type: "bool", value: false },
          },
        },
      };

      const position = decodeUserPositionResponse(10, "SPZERO", zeroPosition);

      expect(position).toBeDefined();
      expect(position?.totalInvested).toBe(0);
      expect(position?.outcomeAAmount).toBe(0);
      expect(position?.claimed).toBe(false);
    });

    it("should handle user position with maximum values", () => {
      const maxPosition = {
        type: "(optional position)",
        value: {
          type: "(tuple position)",
          value: {
            "outcome-a-amount": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "outcome-b-amount": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "outcome-c-amount": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "outcome-d-amount": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            "total-invested": { type: "uint", value: String(Number.MAX_SAFE_INTEGER) },
            claimed: { type: "bool", value: true },
          },
        },
      };

      const position = decodeUserPositionResponse(999, "SPMAX", maxPosition);

      expect(position).toBeDefined();
      expect(position?.totalInvested).toBe(Number.MAX_SAFE_INTEGER);
      expect(position?.claimed).toBe(true);
    });

    it("should handle user position with only one outcome", () => {
      const singleOutcomePosition = {
        type: "(optional position)",
        value: {
          type: "(tuple position)",
          value: {
            "outcome-a-amount": { type: "uint", value: "500000" },
            "outcome-b-amount": { type: "uint", value: "0" },
            "outcome-c-amount": { type: "uint", value: "0" },
            "outcome-d-amount": { type: "uint", value: "0" },
            "total-invested": { type: "uint", value: "500000" },
            claimed: { type: "bool", value: false },
          },
        },
      };

      const position = decodeUserPositionResponse(5, "SPSINGLE", singleOutcomePosition);

      expect(position).toBeDefined();
      expect(position?.outcomeAAmount).toBe(500000);
      expect(position?.outcomeBAmount).toBe(0);
      expect(position?.totalInvested).toBe(500000);
    });

    it("should handle user position with all outcomes equal", () => {
      const evenPosition = {
        type: "(optional position)",
        value: {
          type: "(tuple position)",
          value: {
            "outcome-a-amount": { type: "uint", value: "250000" },
            "outcome-b-amount": { type: "uint", value: "250000" },
            "outcome-c-amount": { type: "uint", value: "250000" },
            "outcome-d-amount": { type: "uint", value: "250000" },
            "total-invested": { type: "uint", value: "1000000" },
            claimed: { type: "bool", value: false },
          },
        },
      };

      const position = decodeUserPositionResponse(20, "SPEVEN", evenPosition);

      expect(position).toBeDefined();
      expect(position?.outcomeAAmount).toBe(250000);
      expect(position?.outcomeBAmount).toBe(250000);
      expect(position?.outcomeCAmount).toBe(250000);
      expect(position?.outcomeDAmount).toBe(250000);
      expect(position?.totalInvested).toBe(1000000);
    });

    it("should handle claimed position with claimed flag true", () => {
      const claimedPosition = {
        type: "(optional position)",
        value: {
          type: "(tuple position)",
          value: {
            "outcome-a-amount": { type: "uint", value: "100000" },
            "outcome-b-amount": { type: "uint", value: "100000" },
            "outcome-c-amount": { type: "uint", value: "0" },
            "outcome-d-amount": { type: "uint", value: "0" },
            "total-invested": { type: "uint", value: "200000" },
            claimed: { type: "bool", value: true },
          },
        },
      };

      const position = decodeUserPositionResponse(15, "SPCLAIMED", claimedPosition);

      expect(position).toBeDefined();
      expect(position?.claimed).toBe(true);
      expect(position?.totalInvested).toBe(200000);
    });
  });

  describe("Response Parsing - Type Variations", () => {
    it("should handle numbers as bigint", () => {
      const bigintMarket = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SPBIGINT" },
            title: { type: "(string-utf8 6)", value: "BIGINT" },
            description: { type: "(string-utf8 11)", value: "Test BigInt" },
            "settlement-burn-height": { type: "uint", value: 884000n },
            "settlement-type": { type: "(string-ascii 13)", value: "bigint-test" },
            "possible-outcomes": { type: "uint", value: 2n },
            "total-pool": { type: "uint", value: 600000n },
            "outcome-a-pool": { type: "uint", value: 300000n },
            "outcome-b-pool": { type: "uint", value: 300000n },
            "outcome-c-pool": { type: "uint", value: 0n },
            "outcome-d-pool": { type: "uint", value: 0n },
            "winning-outcome": { type: "(optional none)", value: null },
            settled: { type: "bool", value: false },
            "settled-at-burn-height": { type: "(optional none)", value: null },
            "settlement-block-hash": { type: "(optional none)", value: null },
            "created-at-burn-height": { type: "uint", value: 880000n },
            "created-at-stacks-height": { type: "uint", value: 7880000n },
          },
        },
      };

      const market = decodeMarketResponse(77, bigintMarket);

      expect(market).toBeDefined();
      expect(market?.settlementBurnHeight).toBe(884000);
      expect(market?.totalPool).toBe(600000);
    });

    it("should handle boolean as string", () => {
      const stringBoolMarket = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SPSTRBOOL" },
            title: { type: "(string-utf8 8)", value: "STRBOOL" },
            description: { type: "(string-utf8 17)", value: "Boolean as string" },
            "settlement-burn-height": { type: "uint", value: "850000" },
            "settlement-type": { type: "(string-ascii 13)", value: "string-bool" },
            "possible-outcomes": { type: "uint", value: "2" },
            "total-pool": { type: "uint", value: "800000" },
            "outcome-a-pool": { type: "uint", value: "400000" },
            "outcome-b-pool": { type: "uint", value: "400000" },
            "outcome-c-pool": { type: "uint", value: "0" },
            "outcome-d-pool": { type: "uint", value: "0" },
            "winning-outcome": { type: "(optional none)", value: null },
            settled: "true",
            "settled-at-burn-height": { type: "(optional none)", value: null },
            "settlement-block-hash": { type: "(optional none)", value: null },
            "created-at-burn-height": { type: "uint", value: "840000" },
            "created-at-stacks-height": { type: "uint", value: "5800000" },
          },
        },
      };

      const market = decodeMarketResponse(55, stringBoolMarket);

      expect(market).toBeDefined();
      expect(market?.settled).toBe(true);
    });
  });

  describe("Response Parsing - Null/Undefined Handling", () => {
    it("should return null for undefined market response", () => {
      const market = decodeMarketResponse(0, undefined);
      expect(market).toBeNull();
    });

    it("should return null for null market response", () => {
      const market = decodeMarketResponse(0, null);
      expect(market).toBeNull();
    });

    it("should return null for undefined position response", () => {
      const position = decodeUserPositionResponse(0, "SPTEST", undefined);
      expect(position).toBeNull();
    });

    it("should return null for null position response", () => {
      const position = decodeUserPositionResponse(0, "SPTEST", null);
      expect(position).toBeNull();
    });

    it("should handle missing optional fields with defaults", () => {
      const partialMarket = {
        type: "(optional market)",
        value: {
          type: "(tuple market)",
          value: {
            creator: { type: "principal", value: "SPPARTIAL" },
            title: { type: "(string-utf8 7)", value: "Partial" },
            description: { type: "(string-utf8 18)", value: "Partial market" },
            "settlement-burn-height": { type: "uint", value: "850000" },
            "settlement-type": { type: "(string-ascii 13)", value: "partial" },
            "possible-outcomes": { type: "uint", value: "2" },
            "total-pool": { type: "uint", value: "1000000" },
            "outcome-a-pool": { type: "uint", value: "500000" },
            "outcome-b-pool": { type: "uint", value: "500000" },
            "outcome-c-pool": { type: "uint", value: "0" },
            "outcome-d-pool": { type: "uint", value: "0" },
            "winning-outcome": { type: "(optional none)", value: null },
            settled: { type: "bool", value: false },
            "settled-at-burn-height": { type: "(optional none)", value: null },
            "settlement-block-hash": { type: "(optional none)", value: null },
            "created-at-burn-height": { type: "uint", value: "840000" },
            "created-at-stacks-height": { type: "uint", value: "6000000" },
            // Missing some fields - should use defaults
          },
        },
      };

      const market = decodeMarketResponse(30, partialMarket);

      expect(market).toBeDefined();
      expect(market?.winningOutcome).toBeNull();
      expect(market?.settlementBlockHash).toBeNull();
    });
  });
});
