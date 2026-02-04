# Tether Wallet (my build)

This is my implementation of a multi‑chain, non‑custodial wallet using WDK.  
I used the **Tether WDK Starter** as a base for the parts where a ready‑made solution was available, and then extended/customized the rest.
Below is a short, practical README describing **what I implemented**, **how to run**, and **how to test**.

## ✅ Implemented Features

### Wallet & Security
- Create wallet and import seed phrase (BIP39 validation included)
- Multi‑wallet support + switching
- Biometric unlock + **PIN fallback** + seed restore
- Secure storage via Keychain/AsyncStorage

### Transactions & Balances
- Balances and activity via WDK Indexer
- Send flow with fee estimation
- Transaction list + **transaction details screen**
- Address validation per network (EVM checksum, BTC, TON, TRON)

### UX
- Receive flow with QR code
- Scan QR for address + **scan‑to‑seed** for import
- Error banners for balance/transaction fetch issues

## 🧪 Mock Transactions (for UI testing)

Mainnet does **not** provide free “test tokens”, so you can’t rely on faucets there.  
To test UI flows without real funds, I added a **dev‑only mock transaction**:

Enable it via `.env`:
```
EXPO_PUBLIC_ENABLE_MOCK_TX=true
```

When enabled, **Wallet** and **Activity** screens show an **“Add Mock Transaction”** button if the list is empty.

## 🧪 Unit Tests

I added unit tests for:
- `services/wallet-store.ts`
- `services/pricing-service.ts`
- `utils/*` (formatters, gas fee, address validation, PIN storage)

Run:
```
npm test
```

## 🚀 Run

```
npm install
npm run ios
# or
npm run android
```

## 🔧 Environment

`.env`:
```
EXPO_PUBLIC_WDK_INDEXER_BASE_URL=https://wdk-api.tether.io
EXPO_PUBLIC_WDK_INDEXER_API_KEY=...
EXPO_PUBLIC_WDK_NETWORK=mainnet
EXPO_PUBLIC_ENABLE_MOCK_TX=true   # optional, dev only
```

## Notes
- For real transaction tests: use a testnet or fund a mainnet wallet.
- Public RPCs can be flaky; you can customize them in `src/config/get-chains-config.ts`.
