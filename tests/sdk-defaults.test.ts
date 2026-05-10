import { describe, expect, it } from "vitest";
import { MarketContractService, initializeMarketSDK } from "../src";

describe("sdk defaults", () => {
  it("targets the V3 contract by default", () => {
    const service = new MarketContractService("SP123", true);

    expect((service as any).contractName).toBe("btc-prediction-market-v3");
  });

  it("lets the factory override the contract name when needed", () => {
    const service = initializeMarketSDK("SP123", false, "btc-prediction-market-v2");

    expect((service as any).contractName).toBe("btc-prediction-market-v2");
  });

  it("exposes the configured contract address", () => {
    const service = new MarketContractService("SP456", true);

    expect(service.getContractAddress()).toBe("SP456");
  });

  it("exposes the configured contract name", () => {
    const service = initializeMarketSDK("SP456", false, "btc-prediction-market-v9");

    expect(service.getContractName()).toBe("btc-prediction-market-v9");
  });

  it("builds a contract identifier from address and name", () => {
    const service = initializeMarketSDK("SP456", false, "btc-prediction-market-v9");

    expect(service.getContractIdentifier()).toBe("SP456.btc-prediction-market-v9");
  });

  it("reports the configured network mode", () => {
    expect(new MarketContractService("SP123", true).getNetworkMode()).toBe("mainnet");
    expect(new MarketContractService("ST123", false).getNetworkMode()).toBe("testnet");
  });
});
