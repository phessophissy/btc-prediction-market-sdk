// @vitest-environment node

import { describe, expect, it, beforeEach, vi } from "vitest";
import { MarketContractService } from "../src";
import * as stacksTransactions from "@stacks/transactions";
import * as stacksNetwork from "@stacks/network";

// Mock Stacks libraries
vi.mock("@stacks/transactions");
vi.mock("@stacks/network");

// Test data
const MOCK_CONTRACT_ADDRESS = "SP39SAY10HP2AV9EPT29AD4706XK2Q2RM741ZHBZK";
const MOCK_SENDER_KEY =
  "e494f0c6f58b44d3d79265b8ea6b4762711b1d64981dda4c3510fbf32b92c8fd01";
const MOCK_USER_ADDRESS = "SP2TESTUSER123456789012345678901234XY1234";
const MOCK_NEW_OWNER = "SP3NEWOWNER12345678901234567890123456789";
const MOCK_TXID = "0x1234567890abcdef";

// Mock market response
const mockMarketResponse = {
  type: "(optional market)",
  value: {
    type: "(tuple market)",
    value: {
      creator: { type: "principal", value: MOCK_USER_ADDRESS },
      title: { type: "(string-utf8 27)", value: "BTC Above $100k" },
      description: {
        type: "(string-utf8 50)",
        value: "Will Bitcoin price exceed $100,000 USD?",
      },
      "settlement-burn-height": { type: "uint", value: "934032" },
      "settlement-type": { type: "(string-ascii 13)", value: "hash-even-odd" },
      "possible-outcomes": { type: "uint", value: "2" },
      "total-pool": { type: "uint", value: "500000" },
      "outcome-a-pool": { type: "uint", value: "250000" },
      "outcome-b-pool": { type: "uint", value: "250000" },
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
};

// Mock user position response
const mockUserPositionResponse = {
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
};

// Mock empty optional response
const mockEmptyOptional = {
  type: "(optional none)",
  value: null,
};

describe("MarketContractService - Read Methods", () => {
  let service: MarketContractService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock StacksTestnet constructor
    (stacksNetwork.StacksTestnet as any).mockImplementation(() => ({}));

    // Mock getAddressFromPrivateKey
    (stacksTransactions.getAddressFromPrivateKey as any).mockReturnValue(
      MOCK_USER_ADDRESS
    );

    service = new MarketContractService(MOCK_CONTRACT_ADDRESS, false);
  });

  describe("getMarket", () => {
    it("should fetch and decode a market successfully", async () => {
      const mockCVResult = { test: "value" };
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue(
        mockCVResult
      );
      (stacksTransactions.cvToJSON as any).mockReturnValue(mockMarketResponse);

      const market = await service.getMarket(0);

      expect(market).toBeDefined();
      expect(market?.id).toBe(0);
      expect(market?.title).toBe("BTC Above $100k");
      expect(market?.possibleOutcomes).toBe(2);

      expect(stacksTransactions.callReadOnlyFunction).toHaveBeenCalledWith({
        contractAddress: MOCK_CONTRACT_ADDRESS,
        contractName: "btc-prediction-market-v3",
        functionName: "get-market",
        functionArgs: expect.any(Array),
        network: expect.any(Object),
        senderAddress: MOCK_CONTRACT_ADDRESS,
      });
    });

    it("should return null when market does not exist", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue(mockEmptyOptional);

      const market = await service.getMarket(999);

      expect(market).toBeNull();
    });

    it("should handle market with settled outcome", async () => {
      const settledMarketResponse = {
        ...mockMarketResponse,
        value: {
          ...mockMarketResponse.value,
          value: {
            ...mockMarketResponse.value.value,
            settled: { type: "bool", value: true },
            "winning-outcome": { type: "uint", value: "0" },
            "settled-at-burn-height": { type: "uint", value: "934032" },
          },
        },
      };

      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue(
        settledMarketResponse
      );

      const market = await service.getMarket(0);

      expect(market?.settled).toBe(true);
      expect(market?.winningOutcome).toBe(0);
    });
  });

  describe("getMarketCount", () => {
    it("should fetch the total market count", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "42",
      });

      const count = await service.getMarketCount();

      expect(count).toBe(42);
      expect(stacksTransactions.callReadOnlyFunction).toHaveBeenCalledWith({
        contractAddress: MOCK_CONTRACT_ADDRESS,
        contractName: "btc-prediction-market-v3",
        functionName: "get-market-count",
        functionArgs: [],
        network: expect.any(Object),
        senderAddress: MOCK_CONTRACT_ADDRESS,
      });
    });

    it("should return 0 when no markets exist", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "0",
      });

      const count = await service.getMarketCount();

      expect(count).toBe(0);
    });
  });

  describe("getUserPosition", () => {
    it("should fetch user position in a market", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue(
        mockUserPositionResponse
      );

      const position = await service.getUserPosition(0, MOCK_USER_ADDRESS);

      expect(position).toBeDefined();
      expect(position?.marketId).toBe(0);
      expect(position?.userAddress).toBe(MOCK_USER_ADDRESS);
      expect(position?.outcomeAAmount).toBe(100000);
      expect(position?.outcomeBAmount).toBe(200000);
      expect(position?.totalInvested).toBe(300000);
      expect(position?.claimed).toBe(false);
    });

    it("should return null when user has no position", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue(mockEmptyOptional);

      const position = await service.getUserPosition(0, MOCK_USER_ADDRESS);

      expect(position).toBeNull();
    });

    it("should handle user position with claimed winnings", async () => {
      const claimedPosition = {
        ...mockUserPositionResponse,
        value: {
          ...mockUserPositionResponse.value,
          value: {
            ...mockUserPositionResponse.value.value,
            claimed: { type: "bool", value: true },
          },
        },
      };

      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue(claimedPosition);

      const position = await service.getUserPosition(5, MOCK_USER_ADDRESS);

      expect(position?.claimed).toBe(true);
    });
  });

  describe("getCurrentBurnHeight", () => {
    it("should fetch current BTC burn height", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "850000",
      });

      const height = await service.getCurrentBurnHeight();

      expect(height).toBe(850000);
    });

    it("should return 0 if height is null", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue(null);

      const height = await service.getCurrentBurnHeight();

      expect(height).toBe(0);
    });
  });

  describe("Owner/Admin - Read Methods", () => {
    describe("getOwner", () => {
      it("should fetch the current contract owner", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "principal",
          value: MOCK_USER_ADDRESS,
        });

        const owner = await service.getOwner();

        expect(owner).toBe(MOCK_USER_ADDRESS);
      });
    });

    describe("getPendingOwner", () => {
      it("should fetch pending owner when transfer is in progress", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "(optional principal)",
          value: MOCK_NEW_OWNER,
        });

        const pending = await service.getPendingOwner();

        expect(pending).toBe(MOCK_NEW_OWNER);
      });

      it("should return null when no ownership transfer is pending", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue(mockEmptyOptional);

        const pending = await service.getPendingOwner();

        expect(pending).toBeNull();
      });
    });

    describe("getContractBalance", () => {
      it("should fetch the contract STX balance", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "uint",
          value: "5000000",
        });

        const balance = await service.getContractBalance();

        expect(balance).toBe(5000000);
      });
    });

    describe("getTotalFeesCollected", () => {
      it("should fetch cumulative fees collected", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "uint",
          value: "2500000",
        });

        const fees = await service.getTotalFeesCollected();

        expect(fees).toBe(2500000);
      });
    });

    describe("isPaused", () => {
      it("should return false when contract is active", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "bool",
          value: false,
        });

        const paused = await service.isPaused();

        expect(paused).toBe(false);
      });

      it("should return true when contract is paused", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "bool",
          value: true,
        });

        const paused = await service.isPaused();

        expect(paused).toBe(true);
      });
    });

    describe("isEmergency", () => {
      it("should return false during normal operations", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "bool",
          value: false,
        });

        const emergency = await service.isEmergency();

        expect(emergency).toBe(false);
      });

      it("should return true during emergency mode", async () => {
        (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
        (stacksTransactions.cvToJSON as any).mockReturnValue({
          type: "bool",
          value: true,
        });

        const emergency = await service.isEmergency();

        expect(emergency).toBe(true);
      });
    });
  });
});

describe("MarketContractService - Write Methods", () => {
  let service: MarketContractService;

  beforeEach(() => {
    vi.clearAllMocks();

    (stacksNetwork.StacksTestnet as any).mockImplementation(() => ({}));
    (stacksTransactions.getAddressFromPrivateKey as any).mockReturnValue(
      MOCK_USER_ADDRESS
    );

    service = new MarketContractService(MOCK_CONTRACT_ADDRESS, false);

    // Mock successful transaction broadcast
    (stacksTransactions.makeContractCall as any).mockResolvedValue({
      signature: "test",
    });
    (stacksTransactions.broadcastTransaction as any).mockResolvedValue({
      txid: MOCK_TXID,
    });

    // Mock read-only calls for validation
    (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
    (stacksTransactions.cvToJSON as any).mockReturnValue({
      type: "uint",
      value: "829000",
    });
  });

  describe("createBinaryMarket", () => {
    it("should create a market with valid title, description, and settlement height", async () => {
      const txid = await service.createBinaryMarket(
        "BTC Above $100k",
        "Will Bitcoin price exceed $100,000 USD by end of Q1 2026?",
        829100,
        MOCK_SENDER_KEY
      );

      expect(txid).toBe(MOCK_TXID);

      expect(stacksTransactions.makeContractCall).toHaveBeenCalled();
      expect(stacksTransactions.broadcastTransaction).toHaveBeenCalled();
    });

    it("should reject market with title too short", async () => {
      await expect(
        service.createBinaryMarket("BTC", "Valid description here", 829100, MOCK_SENDER_KEY)
      ).rejects.toThrow("Title must be at least 3 characters");
    });

    it("should reject market with title too long", async () => {
      const longTitle = "A".repeat(257);
      await expect(
        service.createBinaryMarket(
          longTitle,
          "Valid description here",
          829100,
          MOCK_SENDER_KEY
        )
      ).rejects.toThrow("Title must not exceed 256 characters");
    });

    it("should reject market with description too short", async () => {
      await expect(
        service.createBinaryMarket(
          "Valid Title",
          "Too",
          829100,
          MOCK_SENDER_KEY
        )
      ).rejects.toThrow("Description must be at least 5 characters");
    });

    it("should reject market with description too long", async () => {
      const longDesc = "A".repeat(1025);
      await expect(
        service.createBinaryMarket(
          "Valid Title",
          longDesc,
          829100,
          MOCK_SENDER_KEY
        )
      ).rejects.toThrow("Description exceeds 1024 characters");
    });

    it("should reject market with settlement height too close", async () => {
      await expect(
        service.createBinaryMarket(
          "BTC Above $100k",
          "Will Bitcoin price exceed $100,000 USD by end of Q1 2026?",
          829002,
          MOCK_SENDER_KEY
        )
      ).rejects.toThrow("Settlement must be at least 6 blocks in the future");
    });

    it("should apply post-conditions for market creation fee", async () => {
      await service.createBinaryMarket(
        "BTC Above $100k",
        "Will Bitcoin price exceed $100,000 USD by end of Q1 2026?",
        829100,
        MOCK_SENDER_KEY
      );

      const callArgs = (stacksTransactions.makeContractCall as any).mock
        .calls[0][0];
      expect(callArgs.postConditionMode).toBeDefined();
      expect(callArgs.postConditions).toHaveLength(1);
    });
  });

  describe("Ownership Transfer Methods", () => {
    describe("transferOwnership", () => {
      it("should initiate ownership transfer", async () => {
        const txid = await service.transferOwnership(
          MOCK_NEW_OWNER,
          MOCK_SENDER_KEY
        );

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("transfer-ownership");
      });
    });

    describe("acceptOwnership", () => {
      it("should accept pending ownership transfer", async () => {
        const txid = await service.acceptOwnership(MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("accept-ownership");
        expect(callArgs.functionArgs).toHaveLength(0);
      });
    });

    describe("cancelOwnershipTransfer", () => {
      it("should cancel pending ownership transfer", async () => {
        const txid = await service.cancelOwnershipTransfer(MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe(
          "cancel-ownership-transfer"
        );
      });
    });
  });

  describe("Fee Management Methods", () => {
    describe("withdrawFees", () => {
      it("should withdraw fees to recipient", async () => {
        const amount = 500000;
        const recipient = MOCK_NEW_OWNER;

        const txid = await service.withdrawFees(amount, recipient, MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("withdraw-fees");
        expect(callArgs.functionArgs).toHaveLength(2);
      });

      it("should handle large fee withdrawals", async () => {
        const largeAmount = 999999999;

        const txid = await service.withdrawFees(
          largeAmount,
          MOCK_NEW_OWNER,
          MOCK_SENDER_KEY
        );

        expect(txid).toBe(MOCK_TXID);
      });
    });
  });

  describe("Emergency Methods", () => {
    describe("enableEmergencyMode", () => {
      it("should enable emergency mode", async () => {
        const txid = await service.enableEmergencyMode(MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("enable-emergency-mode");
      });
    });

    describe("emergencyWithdrawAll", () => {
      it("should withdraw all funds in emergency", async () => {
        const txid = await service.emergencyWithdrawAll(MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("emergency-withdraw-all");
      });
    });

    describe("emergencyWithdraw", () => {
      it("should withdraw specific amount in emergency", async () => {
        const amount = 1000000;
        const recipient = MOCK_NEW_OWNER;

        const txid = await service.emergencyWithdraw(
          amount,
          recipient,
          MOCK_SENDER_KEY
        );

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("emergency-withdraw");
      });
    });
  });

  describe("Platform Control Methods", () => {
    describe("setPlatformPaused", () => {
      it("should pause the platform", async () => {
        const txid = await service.setPlatformPaused(true, MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("set-platform-paused");
      });

      it("should resume the platform", async () => {
        const txid = await service.setPlatformPaused(false, MOCK_SENDER_KEY);

        expect(txid).toBe(MOCK_TXID);

        const callArgs = (stacksTransactions.makeContractCall as any).mock
          .calls[0][0];
        expect(callArgs.functionName).toBe("set-platform-paused");
      });
    });
  });
});

describe("MarketContractService - Error Handling", () => {
  let service: MarketContractService;

  beforeEach(() => {
    vi.clearAllMocks();

    (stacksNetwork.StacksTestnet as any).mockImplementation(() => ({}));
    (stacksTransactions.getAddressFromPrivateKey as any).mockReturnValue(
      MOCK_USER_ADDRESS
    );

    service = new MarketContractService(MOCK_CONTRACT_ADDRESS, false);
  });

  describe("Network Error Handling", () => {
    it("should handle network errors on read-only calls", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockRejectedValue(
        new Error("Network timeout")
      );

      await expect(service.getMarketCount()).rejects.toThrow("Network timeout");
    });

    it("should handle network errors on contract calls", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "829000",
      });

      (stacksTransactions.makeContractCall as any).mockRejectedValue(
        new Error("Failed to build transaction")
      );

      await expect(
        service.createBinaryMarket(
          "BTC Above $100k",
          "Valid description",
          829100,
          MOCK_SENDER_KEY
        )
      ).rejects.toThrow("Failed to build transaction");
    });
  });

  describe("Transaction Broadcast Errors", () => {
    it("should handle transaction broadcast rejection", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "829000",
      });

      (stacksTransactions.makeContractCall as any).mockResolvedValue({
        signature: "test",
      });
      (stacksTransactions.broadcastTransaction as any).mockResolvedValue({
        error: "Insufficient funds",
      });

      await expect(
        service.transferOwnership(MOCK_NEW_OWNER, MOCK_SENDER_KEY)
      ).rejects.toThrow("Transaction failed: Insufficient funds");
    });

    it("should handle contract revert errors", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "829000",
      });

      (stacksTransactions.makeContractCall as any).mockResolvedValue({
        signature: "test",
      });
      (stacksTransactions.broadcastTransaction as any).mockResolvedValue({
        error: "Contract call error: unauthorized caller",
      });

      await expect(
        service.enableEmergencyMode(MOCK_SENDER_KEY)
      ).rejects.toThrow("Contract call error: unauthorized caller");
    });
  });

  describe("Validation Error Handling", () => {
    it("should reject empty title", async () => {
      await expect(
        service.createBinaryMarket("", "Valid description", 829100, MOCK_SENDER_KEY)
      ).rejects.toThrow();
    });

    it("should reject whitespace-only title", async () => {
      await expect(
        service.createBinaryMarket(
          "   ",
          "Valid description",
          829100,
          MOCK_SENDER_KEY
        )
      ).rejects.toThrow();
    });

    it("should reject empty description", async () => {
      (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
      (stacksTransactions.cvToJSON as any).mockReturnValue({
        type: "uint",
        value: "829000",
      });

      await expect(
        service.createBinaryMarket("BTC Above $100k", "", 829100, MOCK_SENDER_KEY)
      ).rejects.toThrow();
    });
  });
});

describe("MarketContractService - Network Selection", () => {
  it("should use StacksTestnet by default", () => {
    const mockTestnet = {};
    (stacksNetwork.StacksTestnet as any).mockImplementation(
      () => mockTestnet
    );

    new MarketContractService(MOCK_CONTRACT_ADDRESS, false);

    expect(stacksNetwork.StacksTestnet).toHaveBeenCalled();
  });

  it("should use StacksMainnet when specified", () => {
    const mockMainnet = {};
    (stacksNetwork.StacksMainnet as any).mockImplementation(
      () => mockMainnet
    );

    new MarketContractService(MOCK_CONTRACT_ADDRESS, true);

    expect(stacksNetwork.StacksMainnet).toHaveBeenCalled();
  });
});

describe("MarketContractService - Custom Contract Name", () => {
  it("should use custom contract name when provided", async () => {
    (stacksNetwork.StacksTestnet as any).mockImplementation(() => ({}));
    (stacksTransactions.getAddressFromPrivateKey as any).mockReturnValue(
      MOCK_USER_ADDRESS
    );
    (stacksTransactions.callReadOnlyFunction as any).mockResolvedValue({});
    (stacksTransactions.cvToJSON as any).mockReturnValue({
      type: "uint",
      value: "42",
    });

    const service = new MarketContractService(
      MOCK_CONTRACT_ADDRESS,
      false,
      "custom-contract-name"
    );

    await service.getMarketCount();

    const callArgs = (stacksTransactions.callReadOnlyFunction as any).mock
      .calls[0][0];
    expect(callArgs.contractName).toBe("custom-contract-name");
  });
});
