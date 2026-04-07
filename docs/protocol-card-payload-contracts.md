# Protocol Card Payload Contracts

## Purpose

This note defines the first normalized, fixture-friendly payload layer for the
protocol-specific onboarding cards referenced in
[`design-system-foundation.md`](./design-system-foundation.md) and
[`onboarding-screen-compositions.md`](./onboarding-screen-compositions.md).

Use these shapes between provider adapters and UI primitives. The cards should
consume normalized models from the repo, not raw wallet SDK responses, quote
gateway payloads, or credential-provider objects.

## Contract Rules

- keep the documented card variants unchanged:
  - `WalletConnectionCard`: `disconnected`, `connected`, `wrong_network`,
    `error`
  - `QuoteSummaryCard`: `fresh`, `stale`, `loading`, `error`
  - `CallbackStatusCard`: `pending`, `success`, `failed`
  - `CredentialScopeCard`: `minimal`, `detailed`
- separate card `state` from shared presentation `tone` and actionable
  `reasonCode`
- prefer explicit optional fields over broad nullable payloads
- use ISO 8601 UTC timestamps for all time fields
- use string amounts plus currency or asset metadata, never floating-point math
- normalize chain references before they reach card props so the UI can compare
  active and expected networks deterministically

## Shared Types

```ts
type IsoTimestamp = string;
type HexString = `0x${string}` | string;
type UrlString = string;

type CardTone = "neutral" | "info" | "success" | "warning" | "error";
type AsyncStatus = "idle" | "loading" | "success" | "warning" | "error";

interface CardAction {
  kind:
    | "connect"
    | "reconnect"
    | "switch_network"
    | "refresh_quote"
    | "review_requirements";
  label: string;
  disabled?: boolean;
}

interface BlockingReason {
  code:
    | "provider_missing"
    | "provider_locked"
    | "unsupported_network"
    | "switch_rejected"
    | "signature_unavailable"
    | "quote_expired"
    | "quote_unavailable"
    | "callback_verification_failed"
    | "settlement_failed";
  message: string;
}

interface ChainReference {
  caip2Id: string;
  namespace: string;
  reference: string;
  displayName: string;
  shortName: string;
  environment: "mainnet" | "testnet" | "local";
  nativeCurrencySymbol: string;
  isSupported: boolean;
  explorerUrl?: UrlString;
}

interface DisplayAddress {
  value: HexString;
  displayValue: string;
  ensName?: string;
}

interface MonetaryAmount {
  value: string;
  currency: string;
  decimals: number;
  formatted: string;
}

interface ReadinessState {
  canContinue: boolean;
  blockers: BlockingReason[];
}
```

## Wallet Provider Contract

`WalletConnectionCard` exists to answer one question: can this wallet approve
the next ERC-8004 action on the expected network.

### Wallet state mapping

| Card state | Required model condition |
| --- | --- |
| `disconnected` | no readable wallet account is connected |
| `connected` | account is connected, expected chain matches active chain, signer is readable |
| `wrong_network` | account is connected, but active chain does not match the expected chain or is unsupported |
| `error` | provider interaction failed and the user cannot continue without recovery |

### Types

```ts
type WalletConnectionCardState =
  | "disconnected"
  | "connected"
  | "wrong_network"
  | "error";

type WalletProviderAvailability =
  | "ready"
  | "reconnecting"
  | "unsupported"
  | "unavailable";

interface WalletProviderSummary {
  id: "metamask" | "walletconnect" | "coinbase" | "embedded" | "unknown";
  label: string;
  availability: WalletProviderAvailability;
}

interface ERC8004SignerSummary {
  signerType: "eoa" | "smart_account" | "session_key" | "delegated" | "unknown";
  address: DisplayAddress;
  label: string;
  signatureMethod:
    | "eth_signTypedData_v4"
    | "personal_sign"
    | "contract_call"
    | "unknown";
  chain: ChainReference;
  canSign: boolean;
  readiness:
    | "ready"
    | "wallet_disconnected"
    | "wrong_network"
    | "signature_blocked";
  lastVerifiedAt?: IsoTimestamp;
}

interface WalletConnectionCardModel {
  state: WalletConnectionCardState;
  tone: CardTone;
  provider: WalletProviderSummary;
  expectedChain: ChainReference;
  activeChain?: ChainReference;
  account?: DisplayAddress;
  signer?: ERC8004SignerSummary;
  statusMessage: string;
  reasonCode?: BlockingReason["code"];
  actions: CardAction[];
  lastObservedAt: IsoTimestamp;
}
```

### Rules

- `expectedChain` is always required, even when disconnected, so the card can
  explain the target environment before connect.
- `activeChain` must use the same normalized `ChainReference` shape as
  `expectedChain`; compare `caip2Id`, not display labels.
- `wrong_network` remains a warning-state card unless no supported switch or
  reconnect path exists.
- `switch_network` is present only when the provider can request a network
  change. If not, surface a `reconnect` action and explain the manual step in
  `statusMessage`.

## ERC-8004 Contract Metadata

The ERC-8004 screens need a signer summary plus the smallest contract metadata
payload that supports step 1 preview, step 2 metadata entry, and step 3 review.

```ts
type SettlementMode = "onchain" | "offchain" | "hybrid";
type ContractEnvironment = "production" | "staging" | "sandbox";

interface ERC8004ContractMetadata {
  contractName: string;
  contractAddress: DisplayAddress;
  contractVersion?: string;
  environment: ContractEnvironment;
  requestLabel: string;
  requestDescription: string;
  settlementMode: SettlementMode;
  functionName?: string;
  methodSelector?: HexString;
  chain: ChainReference;
  explorerUrl?: UrlString;
  verificationDomain?: {
    name: string;
    version: string;
    chainCaip2Id: string;
  };
}

interface ERC8004RequestContext {
  protocol: "erc8004";
  wallet: WalletConnectionCardModel;
  signer: ERC8004SignerSummary;
  contract: ERC8004ContractMetadata;
  readiness: ReadinessState;
}
```

### Rules

- `requestLabel` is the short plain-language summary shown in the context rail
  and review step.
- `requestDescription` is required because the design contract expects trust
  copy without exposing raw ABI details.
- keep raw calldata, ABI fragments, and provider-specific signing payloads out
  of this card-facing contract; those belong in adapter or transaction-layer
  types.

## x402 Quote And Settlement Contracts

The x402 screens need one normalized quote model for `QuoteSummaryCard` and one
callback or settlement model for `CallbackStatusCard`.

### Quote state mapping

| Card state | Required model condition |
| --- | --- |
| `fresh` | quote exists, current time is before expiry, no blocking provider error |
| `stale` | quote exists, expiry has passed, refresh is available |
| `loading` | initial quote request or refresh is in flight |
| `error` | no usable quote is available after fetch or refresh |

### Types

```ts
type QuoteSummaryCardState = "fresh" | "stale" | "loading" | "error";
type CallbackStatusCardState = "pending" | "success" | "failed";

interface QuoteFeeLine {
  kind: "protocol" | "network" | "service" | "tax" | "discount" | "other";
  label: string;
  amount: MonetaryAmount;
  includedInTotal: boolean;
}

interface QuoteFreshness {
  quotedAt: IsoTimestamp;
  expiresAt: IsoTimestamp;
  maxAgeSeconds: number;
  refreshedAt?: IsoTimestamp;
}

interface QuotePaymentMethod {
  id: string;
  label: string;
  summary: string;
  recommended?: boolean;
}

interface QuoteSummaryCardModel {
  state: QuoteSummaryCardState;
  tone: CardTone;
  quoteId: string;
  merchantLabel: string;
  resourceLabel: string;
  subtotal: MonetaryAmount;
  total: MonetaryAmount;
  feeBreakdown: QuoteFeeLine[];
  freshness: QuoteFreshness;
  paymentMethods: QuotePaymentMethod[];
  statusMessage: string;
  reasonCode?: BlockingReason["code"];
  actions: CardAction[];
}

interface CallbackVerification {
  method: "hmac_sha256" | "ecdsa" | "ed25519" | "none" | "unknown";
  status: "not_started" | "pending" | "verified" | "failed";
  callbackUrl?: UrlString;
  lastAttemptAt?: IsoTimestamp;
  verifiedAt?: IsoTimestamp;
  failureReason?: string;
}

interface SettlementState {
  mode: "callback" | "redirect" | "polling" | "manual";
  status: "not_started" | "pending" | "settled" | "failed";
  settlementReference?: string;
  expectedBy?: IsoTimestamp;
  settledAt?: IsoTimestamp;
  failureReason?: string;
}

interface CallbackTimelineEvent {
  label: string;
  status: AsyncStatus;
  occurredAt: IsoTimestamp;
}

interface CallbackStatusCardModel {
  state: CallbackStatusCardState;
  tone: CardTone;
  callback: CallbackVerification;
  settlement: SettlementState;
  lastUpdatedAt: IsoTimestamp;
  nextExpectedEvent?: string;
  history?: CallbackTimelineEvent[];
}

interface X402CheckoutContext {
  protocol: "x402";
  quote: QuoteSummaryCardModel;
  callback: CallbackStatusCardModel;
  readiness: ReadinessState;
}
```

### Rules

- `feeBreakdown` must be ordered as rendered. Do not force the UI to sort fee
  rows.
- `total` should already reflect any included fees so the card never recomputes
  totals client-side.
- `CallbackStatusCardModel.state` resolves from terminal status, not from
  transport success alone:
  - `pending` when verification or settlement is still in progress
  - `success` when callback verification is complete and settlement is
    confirmed or no longer blocking
  - `failed` when callback verification or settlement reaches a terminal failure

## AI-Agent Credential Scope Contract

`CredentialScopeCard` needs a stable payload for both the minimal preview and
the detailed review variant used in the AI-agent entry flow.

```ts
type CredentialScopeCardVariant = "minimal" | "detailed";
type CredentialMethod =
  | "api_key"
  | "webhook"
  | "oauth"
  | "wallet"
  | "session_token"
  | "other";
type PermissionLevel = "read" | "write" | "sign" | "admin";

interface CredentialScopeItem {
  key: string;
  label: string;
  permission: PermissionLevel;
  required: boolean;
  reason: string;
}

interface CredentialScopeCardModel {
  variant: CredentialScopeCardVariant;
  tone: CardTone;
  subjectLabel: string;
  credentialMethod: CredentialMethod;
  headline: string;
  summary: string;
  scopes: CredentialScopeItem[];
  environment?: "development" | "staging" | "production";
  expiresAt?: IsoTimestamp;
  constraints?: string[];
}
```

### Rules

- `minimal` and `detailed` are presentation variants over the same underlying
  model, not separate payload families.
- `headline` and `summary` should stay plain-language because the first screen
  copy intentionally avoids provider jargon.
- `reason` is required per scope item so the detailed card can explain why a
  permission exists without inventing new copy fields later.

## Normalization Rules

| Area | Rule |
| --- | --- |
| Timestamps | use ISO 8601 UTC strings |
| Monetary values | store decimal-safe string values and a preformatted display string |
| Addresses and hashes | pass raw value plus truncated display value together |
| Chains | normalize to one `ChainReference` shape before comparison or rendering |
| Errors | use `reasonCode` plus `statusMessage`, not free-form provider dumps |
| Ordering | pre-sort lists that are rendered in a fixed order, such as fees and timelines |

## Example Fixtures

```ts
const erc8004WrongNetworkFixture: ERC8004RequestContext = {
  protocol: "erc8004",
  wallet: {
    state: "wrong_network",
    tone: "warning",
    provider: {
      id: "metamask",
      label: "MetaMask",
      availability: "ready",
    },
    expectedChain: {
      caip2Id: "eip155:8453",
      namespace: "eip155",
      reference: "8453",
      displayName: "Base",
      shortName: "Base",
      environment: "mainnet",
      nativeCurrencySymbol: "ETH",
      isSupported: true,
    },
    activeChain: {
      caip2Id: "eip155:1",
      namespace: "eip155",
      reference: "1",
      displayName: "Ethereum",
      shortName: "Ethereum",
      environment: "mainnet",
      nativeCurrencySymbol: "ETH",
      isSupported: true,
    },
    account: {
      value: "0x8ba1f109551bd432803012645ac136ddd64dba72",
      displayValue: "0x8ba1...ba72",
    },
    statusMessage: "Switch to Base before reviewing the contract request.",
    reasonCode: "unsupported_network",
    actions: [{ kind: "switch_network", label: "Switch to Base" }],
    lastObservedAt: "2026-04-07T09:50:00Z",
  },
  signer: {
    signerType: "eoa",
    address: {
      value: "0x8ba1f109551bd432803012645ac136ddd64dba72",
      displayValue: "0x8ba1...ba72",
    },
    label: "Primary signer",
    signatureMethod: "eth_signTypedData_v4",
    chain: {
      caip2Id: "eip155:1",
      namespace: "eip155",
      reference: "1",
      displayName: "Ethereum",
      shortName: "Ethereum",
      environment: "mainnet",
      nativeCurrencySymbol: "ETH",
      isSupported: true,
    },
    canSign: false,
    readiness: "wrong_network",
  },
  contract: {
    contractName: "UsageEscrow",
    contractAddress: {
      value: "0x1111111111111111111111111111111111111111",
      displayValue: "0x1111...1111",
    },
    environment: "production",
    requestLabel: "Approve escrow-backed usage request",
    requestDescription:
      "This request prepares a signer-approved usage contract for the selected wallet.",
    settlementMode: "hybrid",
    chain: {
      caip2Id: "eip155:8453",
      namespace: "eip155",
      reference: "8453",
      displayName: "Base",
      shortName: "Base",
      environment: "mainnet",
      nativeCurrencySymbol: "ETH",
      isSupported: true,
    },
  },
  readiness: {
    canContinue: false,
    blockers: [
      {
        code: "unsupported_network",
        message: "Switch the connected wallet to Base before continuing.",
      },
    ],
  },
};

const x402StaleQuoteFixture: X402CheckoutContext = {
  protocol: "x402",
  quote: {
    state: "stale",
    tone: "warning",
    quoteId: "quote_01JQEXAMPLE",
    merchantLabel: "Paperclip Pro",
    resourceLabel: "Team seat activation",
    subtotal: {
      value: "25.00",
      currency: "USD",
      decimals: 2,
      formatted: "$25.00",
    },
    total: {
      value: "27.10",
      currency: "USD",
      decimals: 2,
      formatted: "$27.10",
    },
    feeBreakdown: [
      {
        kind: "service",
        label: "Service fee",
        amount: {
          value: "1.50",
          currency: "USD",
          decimals: 2,
          formatted: "$1.50",
        },
        includedInTotal: true,
      },
      {
        kind: "network",
        label: "Network fee",
        amount: {
          value: "0.60",
          currency: "USD",
          decimals: 2,
          formatted: "$0.60",
        },
        includedInTotal: true,
      },
    ],
    freshness: {
      quotedAt: "2026-04-07T09:42:00Z",
      expiresAt: "2026-04-07T09:47:00Z",
      maxAgeSeconds: 300,
    },
    paymentMethods: [
      {
        id: "wallet",
        label: "Wallet payment",
        summary: "Fastest path when the connected wallet is ready.",
        recommended: true,
      },
    ],
    statusMessage: "Quote expired. Refresh pricing before selecting a payment path.",
    reasonCode: "quote_expired",
    actions: [{ kind: "refresh_quote", label: "Refresh quote" }],
  },
  callback: {
    state: "pending",
    tone: "warning",
    callback: {
      method: "hmac_sha256",
      status: "pending",
      callbackUrl: "https://example.com/x402/callback",
      lastAttemptAt: "2026-04-07T09:46:30Z",
    },
    settlement: {
      mode: "callback",
      status: "pending",
      expectedBy: "2026-04-07T09:48:00Z",
    },
    lastUpdatedAt: "2026-04-07T09:46:30Z",
    nextExpectedEvent: "Awaiting verified callback delivery",
  },
  readiness: {
    canContinue: false,
    blockers: [
      {
        code: "quote_expired",
        message: "Refresh the quote before enabling the payment flow.",
      },
    ],
  },
};
```

## Open Questions

- confirm the final ERC-8004 verification-domain fields and signature method
  requirements before any live signing adapter is built
- confirm which wallet providers must support programmatic network switching
  versus manual reconnect on day one
- confirm the x402 callback verification method and whether settlement success
  can be shown before the verification channel reaches a terminal state
