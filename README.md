# BTC Prediction Market SDK

TypeScript SDK for interacting with the Bitcoin-anchored prediction market on Stacks.

This package is aligned with the current `btc-prediction-market-v3` contract surface.

## Install

```bash
npm install @phessophissy/btc-prediction-market-sdk
```

## Quick Start

```ts
import { initializeMarketSDK } from "@phessophissy/btc-prediction-market-sdk";

const sdk = initializeMarketSDK(
  "YOUR_CONTRACT_ADDRESS",
  true,
  "btc-prediction-market-v3"
);

const marketCount = await sdk.getMarketCount();
const marketZero = await sdk.getMarket(0);
```

## Instance Metadata Helpers

```ts
sdk.getContractAddress();
sdk.getContractName();
sdk.getContractIdentifier();
sdk.getNetworkMode();
sdk.getMarketCreationFeeMicrostx();
```

## Supported V3 Methods

### Market

- `createBinaryMarket(title, description, settlementBurnHeight, senderKey)`
- `getMarket(marketId)`
- `getMarketCount()`
- `getUserPosition(marketId, userAddress)`
- `getCurrentBurnHeight()`

### Owner / Admin

- `getOwner()`
- `getPendingOwner()`
- `getContractBalance()`
- `getTotalFeesCollected()`
- `isPaused()`
- `isEmergency()`
- `transferOwnership(newOwner, senderKey)`
- `acceptOwnership(senderKey)`
- `cancelOwnershipTransfer(senderKey)`
- `enableEmergencyMode(senderKey)`
- `withdrawFees(amountMicroStx, recipient, senderKey)`
- `emergencyWithdrawAll(senderKey)`
- `emergencyWithdraw(amountMicroStx, recipient, senderKey)`
- `setPlatformPaused(paused, senderKey)`

## Exports

- `MarketContractService`
- `initializeMarketSDK`
- V3 types from `src/types.ts`
- Input validators from `src/utils/validation-50.ts`

### Validation Helpers

The SDK also exports lightweight guards you can use before collecting a wallet
signature or building a UI form submission:

- `validateMarketId(marketId)`
- `validateStandardPrincipal(address)`
- `validateMicroStxAmount(amount)`

## Development

```bash
npm install
npm run build
npm test
```

## Growth Bot

The repository includes a small download/smoke-check bot in `growth-bot/` for
`@phessophissy/btc-prediction-market-sdk@1.1.2`.

Run locally:

```bash
cd growth-bot
npm install
npm run start
```

Automation:

- GitHub Action: `.github/workflows/growth-pulse.yml`
- Schedule: every 30 minutes
- Also supports manual run through `workflow_dispatch`

## Publishing

The package publishes built artifacts from `dist/`.

```bash
npm run build
npm publish --access public
```

## License

MIT
